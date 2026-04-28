import asyncio
import hashlib
import json
import os
import tempfile
from typing import Any, Dict, Optional, Tuple

import logging
from supabase import create_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("moglix_ai_factory_adapter")

BASE_URL = "https://www.moglix.com"


def get_supabase():
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_KEY", "")
    if not supabase_url or not supabase_key:
        raise RuntimeError("Missing SUPABASE_URL / SUPABASE_KEY env vars.")
    return create_client(supabase_url, supabase_key)


def _html_fingerprint(html: str) -> str:
    return hashlib.sha256((html or "").encode("utf-8")).hexdigest()


def _fallback_extraction_code() -> str:
    """
    Deterministic extraction rule (used when GPT is unavailable).
    Writes output JSON to output_path:
      {"product_urls": [...], "product_names_by_url": {...}}
    """
    return r"""
import json
import re
from urllib.parse import urljoin

BASE_URL = "https://www.moglix.com"

def transform(input_path: str, output_path: str) -> None:
    with open(input_path, "r", encoding="utf-8") as f:
        inp = json.load(f)
    html = inp.get("html", "") or ""

    # Extract absolute mp URLs.
    urls = re.findall(r"https?://www\.moglix\.com/[^\"']+/mp/[^\"']+", html)
    if not urls:
        rels = re.findall(r'href=[\"\'](/[^\"\']+/mp/[^\"\']+)[\"\']', html)
        urls = [BASE_URL + r for r in rels]

    seen = set()
    product_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            product_urls.append(u)

    # Best-effort name extraction from anchors (optional).
    names_by_url = {}
    for m in re.finditer(r'<a[^>]+href=[\"\']([^\"\']+/mp/[^\"\']+)[\"\'][^>]*>(.*?)</a>', html, flags=re.IGNORECASE | re.DOTALL):
        rel = m.group(1)
        full = rel if rel.startswith("http") else (BASE_URL + rel)
        inner = m.group(2) or ""
        text = re.sub(r"<[^>]+>", " ", inner)
        text = re.sub(r"\\s+", " ", text).strip()
        if len(text) >= 4:
            names_by_url[full] = text

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"product_urls": product_urls, "product_names_by_url": names_by_url}, f)
"""


async def _generate_extraction_code_with_gpt(prompt: str) -> str:
    """
    Optional: uses the existing WebScrapy GPTClient if configured.
    Falls back to deterministic code if not configured.
    """
    try:
        import sys
        backend_path = "/Users/krishchoudhary/Downloads/webscrapy-docs/webscrapy/backend"
        if backend_path not in sys.path:
            sys.path.append(backend_path)

        from app.ai.gpt_client import get_gpt_client  # type: ignore

        gpt = get_gpt_client()
        # chat_json expects a JSON response; we ask for code string in JSON.
        resp = await gpt.chat_json(
            prompt=prompt,
            task="extraction",
            temperature=0.0,
            max_tokens=2500,
            use_cache=False,
        )
        code = resp.get("code", "")
        if not code:
            return _fallback_extraction_code()
        return code
    except Exception as e:
        logger.warning("GPT not available for extraction code generation: %s", str(e))
        return _fallback_extraction_code()


def _run_sandbox_generated_code(generated_code: str, input_path: str, output_path: str) -> Tuple[bool, str]:
    """
    Runs generated code using the ai_software_factory sandbox runner.
    """
    import sys
    factory_root = "/Users/krishchoudhary/Downloads/webscrapy-docs/webscrapy/ai_software_factory"
    if factory_root not in sys.path:
        sys.path.append(factory_root)

    from app.execution.sandbox import run_transform  # type: ignore

    result = run_transform(
        generated_code=generated_code,
        input_path=input_path,
        output_path=output_path,
        timeout=180,
    )
    logs = result.get("logs", "")
    return bool(result.get("success")), logs


async def main():
    sb = get_supabase()

    limit = int(os.environ.get("MOG_AI_FACTORY_ADAPTER_LIMIT", "3"))
    max_attempts = int(os.environ.get("MOG_AI_FACTORY_ADAPTER_MAX_ATTEMPTS", "2"))
    adapter_worker_id = os.environ.get("MOG_AI_FACTORY_ADAPTER_WORKER_ID", "ai_factory_adapter")

    tasks = (
        sb.table("moglix_repair_tasks")
        .select("*")
        .eq("status", "needs_repair")
        .limit(limit)
        .execute()
    )
    raw_tasks: list[dict] = tasks.data or []
    logger.info("Adapter fetched %d tasks (status=needs_repair)", len(raw_tasks))

    for t in raw_tasks:
        category_url = t.get("category_url")
        page_number = t.get("page_number")
        expected_on_page = t.get("expected_on_page")
        attempt = int(t.get("ai_factory_attempt", 0) or 0)

        evidence_html = t.get("repaired_html_truncated") or ""
        if not category_url or page_number is None:
            continue
        if not evidence_html:
            logger.warning("Skipping task without evidence_html: category_url=%s page=%s", category_url, page_number)
            continue
        if attempt >= max_attempts:
            logger.info("Skipping task due to max attempts: category_url=%s page=%s", category_url, page_number)
            continue

        html_fp = _html_fingerprint(evidence_html)
        strategy_id = f"ai_factory_rule_{html_fp[:10]}"

        # Write input JSON for the sandboxed transform.
        with tempfile.TemporaryDirectory(prefix="moglix_ai_factory_") as td:
            input_path = os.path.join(td, "input.json")
            output_path = os.path.join(td, "output.json")

            with open(input_path, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "category_url": category_url,
                        "page_number": page_number,
                        "expected_on_page": expected_on_page,
                        "html": evidence_html,
                    },
                    f,
                )

            prompt = f"""
You are writing a single Python function for extracting Moglix listing products.

INPUT: a JSON file at input_path with keys:
  - category_url: string
  - page_number: number
  - expected_on_page: number (int or null)
  - html: string (listing HTML)

REQUIREMENTS:
1) Implement exactly:
   def transform(input_path: str, output_path: str) -> None:
2) Load JSON from input_path and read html.
3) Extract product URLs from the HTML.
   - A product URL contains '/mp/'.
   - Return a de-duplicated list of product URLs.
4) (Optional) Also extract best-effort product names; if hard, return empty mapping.
5) Write ONLY this JSON to output_path:
   {{
     "product_urls": ["..."],
     "product_names_by_url": {{"url":"name", "...": "..."}}
   }}

SECURITY:
- Do not use network calls.
- Do not call os.system or subprocess.

Output raw python code ONLY (no markdown fences).
"""

            generated_code = await _generate_extraction_code_with_gpt(
                prompt=(
                    prompt
                    + "\n\nReturn JSON: {\"code\": \"...python code...\"}."
                )
            )

            # If GPT returned fallback code wrapped in JSON, normalize:
            if generated_code.strip().startswith("{"):
                # Best effort parse (may fail).
                try:
                    generated_code_obj = json.loads(generated_code)
                    generated_code = generated_code_obj.get("code") or _fallback_extraction_code()
                except Exception:
                    generated_code = _fallback_extraction_code()

            success, logs = await asyncio.to_thread(
                _run_sandbox_generated_code, generated_code, input_path, output_path
            )

            if not success:
                logger.error("Sandbox failed for %s %s", category_url, page_number)
                sb.table("moglix_repair_tasks").update(
                    {
                        "status": "needs_repair",
                        "ai_factory_attempt": attempt + 1,
                        "ai_factory_failed": True,
                        "ai_factory_error_log": logs[:2000],
                    }
                ).eq("category_url", category_url).eq("page_number", page_number).execute()
                continue

            if not os.path.exists(output_path):
                logger.error("Sandbox succeeded but output file missing.")
                continue

            with open(output_path, "r", encoding="utf-8") as f:
                out_obj = json.load(f)

            product_urls: list[str] = out_obj.get("product_urls", []) or []
            product_names_by_url: Dict[str, Any] = out_obj.get("product_names_by_url", {}) or {}

            extracted_count = len(product_urls)
            expected_val = int(expected_on_page) if expected_on_page else None
            accept_ratio = float(os.environ.get("MOG_AI_FACTORY_ADAPTER_ACCEPT_RATIO", "0.95"))
            accepted = expected_val is not None and expected_val > 0 and extracted_count >= int(expected_val * accept_ratio)

            # Store learned rule (code) for future runs.
            sb.table("moglix_extraction_rules").insert(
                {
                    "rule_id": strategy_id,
                    "category_url": category_url,
                    "page_number": page_number,
                    "html_fingerprint": html_fp,
                    "rule_code": generated_code,
                    "director_strategy_id": None,
                    "extracted_count": extracted_count,
                    "expected_on_page": expected_val,
                    "accepted": accepted,
                    "created_by": adapter_worker_id,
                }
            ).execute()

            # If accepted, move task forward.
            if accepted:
                sb.table("moglix_repair_tasks").update(
                    {
                        "status": "repaired_ok",
                        "ai_factory_rule_id": strategy_id,
                        "ai_factory_extracted_count": extracted_count,
                        "ai_factory_accepted": True,
                    }
                ).eq("category_url", category_url).eq("page_number", page_number).execute()

                # Upsert products based on extracted URLs + optional names.
                rows = []
                for url in product_urls:
                    rows.append(
                        {
                            "product_url": url,
                            "name": product_names_by_url.get(url),
                            "brand": None,
                            "category_url": category_url,
                            "listing_page": page_number,
                            "source_url": url,
                            "ai_factory_rule_id": strategy_id,
                        }
                    )
                if rows:
                    sb.table("moglix_products_raw").upsert(rows, on_conflict="product_url").execute()
            else:
                sb.table("moglix_repair_tasks").update(
                    {"ai_factory_attempt": attempt + 1, "status": "needs_repair", "ai_factory_extracted_count": extracted_count}
                ).eq("category_url", category_url).eq("page_number", page_number).execute()


if __name__ == "__main__":
    asyncio.run(main())

