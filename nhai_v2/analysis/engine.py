"""
Analysis engine: PDF text → section pages → AI → validated TenderAnalysis.

Handles all tender types:
- RFP (Consultancy): 2-stage, 100-300 pages, full sections
- NIT (Works/Services): single-stage, 5-50 pages, fewer sections
- NIQ (Quotation): minimal, 1-10 pages, basic extraction only
- Multi-document: merge text from NIT + RFP + Vol-I/II
"""
import json
import logging
import re
import warnings
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from pydantic import ValidationError

warnings.filterwarnings("ignore")  # suppress SSL warnings

from config import EYQ_URL, EYQ_KEY, EYQ_API_VERSION, AI_TIMEOUT, PDF_CHUNK_MAX_CHARS
from extraction.pdf import ExtractedDocument, extract_document
from extraction.classifier import classify_tender_type, map_section_pages
from analysis.schema import (
    TenderAnalysis, KeyDates, RFPFees, EligibilityCriteria,
    TechnicalEligibility, FinancialEligibility, EvaluationCriteria,
    ScopeOfRFP, SubmissionMechanisms, InstructionsToBidders,
    ContactSPOC, PaymentTerm, RiskRegulatory, TenderDocument,
)
from analysis import prompts

log = logging.getLogger(__name__)


# ── AI call ──────────────────────────────────────────────────────────────────

def _call_eyq(prompt: str) -> Optional[str]:
    try:
        r = httpx.post(
            EYQ_URL,
            headers={"api-key": EYQ_KEY, "Content-Type": "application/json"},
            params={"api-version": EYQ_API_VERSION},
            json={
                "messages": [{"role": "user", "content": prompt}],
                "max_completion_tokens": 4000,
            },
            timeout=AI_TIMEOUT,
            verify=False,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        log.error("EYQ call failed: %s", e)
        return None


def _parse_json(raw: Optional[str]) -> Optional[dict | list]:
    if not raw:
        return None
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to repair truncated JSON
        try:
            # Find last complete object boundary
            for end in [raw.rfind("}"), raw.rfind("]")]:
                if end > 0:
                    candidate = raw[:end + 1]
                    return json.loads(candidate)
        except Exception:
            pass
        log.error("JSON parse failed. raw[:300]: %s", raw[:300])
        return None


def _chunk_text(text: str, max_chars: int = PDF_CHUNK_MAX_CHARS) -> str:
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    last_newline = truncated.rfind("\n")
    return truncated[:last_newline] if last_newline > 0 else truncated


# ── Document type detection ───────────────────────────────────────────────────

def _detect_doc_type(total_pages: int, filename: str, title: str) -> str:
    """Classify document complexity to adjust extraction strategy."""
    fname = filename.lower()
    title_lower = title.lower()
    if total_pages >= 80 or "rfp" in fname:
        return "rfp"
    if total_pages >= 20 or "nit" in fname or "vol" in fname:
        return "nit"
    return "niq"  # short quotation documents


# ── Section text builder ──────────────────────────────────────────────────────

def _section_text(
    doc: ExtractedDocument,
    section_map: dict[str, list[int]],
    section_key: str,
    fallback_pages: list[int] = None,
    max_chars: int = PDF_CHUNK_MAX_CHARS,
) -> str:
    pages = section_map.get(section_key, [])
    if not pages and fallback_pages:
        pages = fallback_pages
    elif not pages:
        pages = list(range(1, min(11, doc.total_pages + 1)))
    return _chunk_text(doc.text_for_pages(pages), max_chars)


def _risk_text(doc: ExtractedDocument, section_map: dict) -> str:
    """
    Risk clauses are in the contract conditions section, often in the last
    40% of RFP documents. Do a full-document scan for risk-specific keywords.
    """
    risk_keywords = [
        "force majeure", "liquidated damage", "termination",
        "arbitration", "indemnity", "insurance", "integrity pact",
        "general conditions of contract", "dispute",
    ]
    # Full scan — don't use window, find exact pages
    risk_pages = []
    for page in doc.pages:
        lower = page.text.lower()
        if any(kw in lower for kw in risk_keywords):
            risk_pages.append(page.page_num)

    # Deduplicate and limit to 20 most relevant pages
    risk_pages = sorted(set(risk_pages))[:20]

    if not risk_pages:
        # Fallback: last 30 pages of document
        start = max(1, doc.total_pages - 30)
        risk_pages = list(range(start, doc.total_pages + 1))

    log.info("Risk pages (full scan): %s", risk_pages[:10])
    return _chunk_text(doc.text_for_pages(risk_pages))


# ── Multi-document merge ──────────────────────────────────────────────────────

def _merge_docs(extracted_docs: list[ExtractedDocument]) -> ExtractedDocument:
    """
    When multiple PDFs exist (RFP + NIT + Vol-I etc.), merge them.
    Largest PDF is primary; other docs contribute to section mapping.
    """
    if len(extracted_docs) == 1:
        return extracted_docs[0]

    # Sort: largest first
    sorted_docs = sorted(extracted_docs, key=lambda d: d.total_pages, reverse=True)
    primary = sorted_docs[0]

    # Append secondary docs' pages with offset numbering
    # (keeps page citations accurate per-document)
    all_pages = list(primary.pages)
    for secondary in sorted_docs[1:]:
        for page in secondary.pages:
            # Re-label with filename prefix so AI can cite correctly
            from extraction.pdf import PagedText
            labelled = PagedText(
                page_num=page.page_num,
                text=f"[FROM: {secondary.path.name}]\n{page.text}"
            )
            all_pages.append(labelled)

    from extraction.pdf import ExtractedDocument as ED
    merged = ED(path=primary.path, pages=all_pages)
    merged.total_pages = primary.total_pages  # keep primary's page count for window logic
    return merged


# ── API date pre-seeding ──────────────────────────────────────────────────────

def _extract_api_dates(api_detail: dict) -> dict:
    """Pull guaranteed-accurate dates from the API response."""
    if not api_detail:
        return {}
    imp = (api_detail.get("important_dates") or [{}])[0]
    result = {}
    if imp.get("Bid Submission End Date"):
        result["proposal_submission_deadline"] = imp["Bid Submission End Date"]
    if imp.get("Bid Opening Date Time"):
        result["technical_bid_opening"] = imp["Bid Opening Date Time"]
    if imp.get("Priced Bid Opening Date"):
        result["financial_bid_opening"] = imp["Priced Bid Opening Date"]
    if imp.get("Pre Bid Meeting Date"):
        result["pre_bid_meeting"] = imp["Pre Bid Meeting Date"]
    start = imp.get("Tender Document Sales Start Date", "")
    end = imp.get("Tender Document Sales End Date", "")
    if start or end:
        result["document_download_period"] = f"{start} to {end}".strip(" to ")
    return result


# ── Section extractor ─────────────────────────────────────────────────────────

def _run_section(prompt_fn, text: str, model_cls, fallback):
    raw = _call_eyq(prompt_fn(text))
    data = _parse_json(raw)
    if data is None:
        return fallback
    try:
        if isinstance(data, list):
            return data
        return model_cls(**data)
    except (ValidationError, TypeError):
        try:
            return model_cls.model_validate(data)
        except Exception:
            return fallback


# ── Main orchestrator ─────────────────────────────────────────────────────────

def analyze_tender(
    tender_id: str,
    tender_no: str,
    title: str,
    downloaded_docs: list[dict],
    api_detail: dict = None,
) -> TenderAnalysis:
    """
    Complete pipeline for ANY tender type.
    Handles: 0 docs, 1 doc, many docs, short NIQ, long RFP.
    """
    log.info("═══ Analyzing tender %s — %s ═══", tender_id, tender_no)

    # ── Build document objects ────────────────────────────────────────────────
    doc_objects: list[TenderDocument] = []
    extracted_docs: list[ExtractedDocument] = []

    for d in downloaded_docs:
        td = TenderDocument(
            description=d.get("description", ""),
            filename=d.get("filename", ""),
            url=d.get("url", ""),
            local_path=d.get("local_path"),
            filesize=d.get("filesize", "N/A"),
            extension=d.get("extension", ""),
            download_error=d.get("error"),
        )
        doc_objects.append(td)

        if d.get("local_path") and not d.get("error"):
            path = Path(d["local_path"])
            if path.suffix.lower() == ".pdf":
                try:
                    extracted = extract_document(path)
                    if extracted:
                        log.info("  PDF: %s — %d pages", path.name, extracted.total_pages)
                        extracted_docs.append(extracted)
                except Exception as e:
                    log.error("  PDF extract failed %s: %s", path.name, e)

    # ── No PDFs: use API data only ────────────────────────────────────────────
    api_dates = _extract_api_dates(api_detail)
    api_basic = {}
    if api_detail:
        basic = (api_detail.get("basic_information") or [{}])[0]
        api_basic = {
            "emd_amount": basic.get("EMD Value", ""),
            "rfp_fee_amount": basic.get("Application Fee", ""),
            "tender_type_raw": basic.get("Tender Type", ""),
            "procurement_cat": basic.get("Procurement Category", ""),
        }

    if not extracted_docs:
        log.warning("No PDFs extracted — building analysis from API data only")
        key_dates = KeyDates(**{k: v for k, v in api_dates.items() if v})
        rfp_fees = RFPFees(
            emd_amount=api_basic.get("emd_amount") or "N/A",
            rfp_fee_amount=api_basic.get("rfp_fee_amount") or "N/A",
        )
        return TenderAnalysis(
            tender_id=tender_id, tender_no=tender_no, title=title,
            tender_type="unknown", confidence="low",
            analyzed_at=datetime.now(timezone.utc).isoformat(),
            key_dates=key_dates, rfp_fees=rfp_fees,
            documents=doc_objects,
        )

    # ── Merge multi-doc into one working document ─────────────────────────────
    working_doc = _merge_docs(extracted_docs)
    doc_type = _detect_doc_type(working_doc.total_pages, extracted_docs[0].path.name, title)
    tender_type = classify_tender_type(working_doc)
    log.info("Doc type: %s | Tender type: %s | Total pages: %d",
             doc_type, tender_type, working_doc.total_pages)

    # ── Map sections to pages ─────────────────────────────────────────────────
    section_map = map_section_pages(working_doc)
    log.info("Section map: %s", {k: v[:3] for k, v in section_map.items() if v})

    def txt(key, fallback=None):
        return _section_text(working_doc, section_map, key, fallback_pages=fallback)

    # ── KEY DATES ─────────────────────────────────────────────────────────────
    log.info("→ Key dates")
    kd_data = _parse_json(_call_eyq(prompts.key_dates_prompt(txt("key_dates")))) or {}
    # API dates always override AI for fields AI missed
    for field, val in api_dates.items():
        if val and (not kd_data.get(field) or kd_data.get(field) == "N/A"):
            kd_data[field] = val
    try:
        key_dates = KeyDates(**kd_data)
    except Exception:
        key_dates = KeyDates(**{k: v for k, v in api_dates.items() if v})

    # ── RFP FEES ──────────────────────────────────────────────────────────────
    log.info("→ RFP fees")
    fees_data = _parse_json(_call_eyq(prompts.rfp_fees_prompt(txt("rfp_fees")))) or {}
    # API basic overrides
    if api_basic.get("emd_amount") and (not fees_data.get("emd_amount") or fees_data.get("emd_amount") == "N/A"):
        fees_data["emd_amount"] = api_basic["emd_amount"]
    if api_basic.get("rfp_fee_amount") and (not fees_data.get("rfp_fee_amount") or fees_data.get("rfp_fee_amount") == "N/A"):
        fees_data["rfp_fee_amount"] = api_basic["rfp_fee_amount"]
    try:
        rfp_fees = RFPFees(**fees_data)
    except Exception:
        rfp_fees = RFPFees()

    # ── ELIGIBILITY ───────────────────────────────────────────────────────────
    log.info("→ Eligibility")
    elig_pages = sorted(set(
        section_map.get("eligibility_technical", []) +
        section_map.get("eligibility_financial", [])
    ))
    elig_text = _chunk_text(working_doc.text_for_pages(elig_pages) if elig_pages
                            else working_doc.text_for_pages(list(range(1, 15))))
    elig_data = _parse_json(_call_eyq(prompts.eligibility_prompt(elig_text))) or {}
    try:
        eligibility = EligibilityCriteria(
            technical=TechnicalEligibility(**(elig_data.get("technical") or {})),
            financial=FinancialEligibility(**(elig_data.get("financial") or {})),
        )
    except Exception:
        eligibility = EligibilityCriteria()

    # ── EVALUATION ────────────────────────────────────────────────────────────
    log.info("→ Evaluation criteria")
    eval_data = _parse_json(_call_eyq(prompts.evaluation_prompt(txt("evaluation_criteria")))) or {}
    try:
        evaluation = EvaluationCriteria(**eval_data)
    except Exception:
        evaluation = EvaluationCriteria()

    # ── SCOPE ─────────────────────────────────────────────────────────────────
    log.info("→ Scope of work")
    # For scope: combine scope_of_work pages + first 5 pages (general description)
    scope_pages = sorted(set(section_map.get("scope_of_work", []) + list(range(1, 6))))
    scope_text = _chunk_text(working_doc.text_for_pages(scope_pages))
    scope_data = _parse_json(_call_eyq(prompts.scope_prompt(scope_text))) or {}
    try:
        scope = ScopeOfRFP(**scope_data)
    except Exception:
        scope = ScopeOfRFP()

    # ── SUBMISSION ────────────────────────────────────────────────────────────
    log.info("→ Submission mechanisms")
    sub_data = _parse_json(_call_eyq(prompts.submission_prompt(txt("submission_format")))) or {}
    try:
        submission = SubmissionMechanisms(**sub_data)
    except Exception:
        submission = SubmissionMechanisms()

    # ── INSTRUCTIONS ──────────────────────────────────────────────────────────
    log.info("→ Instructions to bidders")
    inst_data = _parse_json(_call_eyq(prompts.instructions_prompt(txt("instructions_to_bidders")))) or {}
    try:
        instructions = InstructionsToBidders(**inst_data)
    except Exception:
        instructions = InstructionsToBidders()

    # ── CONTACTS ──────────────────────────────────────────────────────────────
    log.info("→ Contacts / SPOC")
    contacts_data = _parse_json(_call_eyq(prompts.contact_prompt(txt("contact_spoc")))) or []
    contacts = []
    if isinstance(contacts_data, list):
        for c in contacts_data:
            try:
                contacts.append(ContactSPOC(**c))
            except Exception:
                pass

    # ── PAYMENT TERMS ─────────────────────────────────────────────────────────
    log.info("→ Payment terms")
    pay_data = _parse_json(_call_eyq(prompts.payment_terms_prompt(txt("payment_terms")))) or []
    payment_terms = []
    if isinstance(pay_data, list):
        for p in pay_data:
            try:
                payment_terms.append(PaymentTerm(**p))
            except Exception:
                pass

    # ── RISK — full document scan ─────────────────────────────────────────────
    log.info("→ Risk & regulatory (full doc scan)")
    risk_text = _risk_text(working_doc, section_map)
    risk_data = _parse_json(_call_eyq(prompts.risk_prompt(risk_text))) or {}
    try:
        risk = RiskRegulatory(**risk_data)
    except Exception:
        risk = RiskRegulatory()

    # ── Confidence ────────────────────────────────────────────────────────────
    filled = sum([
        key_dates.proposal_submission_deadline not in ("N/A", ""),
        eligibility.technical.min_annual_turnover not in ("N/A", ""),
        evaluation.selection_method not in ("N/A", ""),
        scope.summary not in ("N/A", ""),
        bool(contacts),
        bool(payment_terms),
        risk.force_majeure not in ("N/A", ""),
    ])
    confidence = "high" if filled >= 5 else "medium" if filled >= 3 else "low"

    log.info("═══ Analysis done — confidence=%s doc_type=%s ═══", confidence, doc_type)

    return TenderAnalysis(
        tender_id=tender_id,
        tender_no=tender_no,
        title=title,
        tender_type=tender_type,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
        source_documents=[d.path.name for d in extracted_docs],
        confidence=confidence,
        key_dates=key_dates,
        rfp_fees=rfp_fees,
        eligibility=eligibility,
        evaluation=evaluation,
        scope=scope,
        submission=submission,
        instructions=instructions,
        contacts=contacts,
        payment_terms=payment_terms,
        risk=risk,
        documents=doc_objects,
    )
