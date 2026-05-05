# NHAI Tender Intelligence System — v2

**Developer:** Krish Choudhary
**Organisation:** Ernst & Young — AI Incubator Division
**Status:** Core pipeline built and tested. Supabase setup + AI integration pending.
**Location:** `/Users/krishchoudhary/GITHUB/SCRAPY/scrapy/nhai_v2/`

---

## What This System Does

Fetches every NHAI tender from the official API, downloads all attached documents (RFP, NIT, BOQ, forms, annexures), extracts text page-by-page from PDFs, maps each section to its exact pages, and runs a targeted AI analysis per section — producing a fully structured, citation-backed intelligence report for each tender.

Every extracted fact carries a page citation and a verbatim snippet from the source document. Nothing is inferred or hallucinated. Missing fields display `N/A`.

---

## Architecture

```
nhai_v2/
├── cli.py                    Entry point — all commands
├── config.py                 Environment variables, constants
├── requirements.txt
├── .env                      Keys (not committed)
├── .env.example              Template
│
├── api/
│   ├── nhai.py               NHAI API — tenderlist + tenderdetail
│   └── documents.py          Download PDFs/XLSX, local cache
│
├── extraction/
│   ├── pdf.py                Page-by-page text extraction with citations
│   └── classifier.py         Tender type detection + section→page mapping
│
├── analysis/
│   ├── schema.py             Pydantic models for complete structured output
│   ├── prompts.py            Section-specific AI prompts (9 sections)
│   └── engine.py             Orchestrator: PDF → pages → AI → TenderAnalysis
│
├── db/
│   └── supabase.py           Supabase: upsert tenders, analysis, upload docs
│
├── migrations/
│   └── 001_schema.sql        Run once in Supabase SQL editor
│
└── documents/
    └── <tender_id>/          Downloaded PDFs cached locally per tender
```

---

## Data Flow

```
NHAI API (tenderlist)
        ↓
  fetch all tender IDs + basic fields
        ↓
NHAI API (tenderdetail) per tender
        ↓
  get: important_dates, basic_information, other_documents (direct PDF URLs)
        ↓
  download all PDFs + XLSX to documents/<tender_id>/
        ↓
  extract text page-by-page from each PDF (pdfplumber)
        ↓
  classify tender type (2-stage vs single-stage)
  map each of 12 sections to their relevant page numbers
        ↓
  for each section → send only relevant pages to AI (EYQ)
  AI returns structured JSON with page citations + verbatim snippets
        ↓
  validate with Pydantic → TenderAnalysis object
        ↓
  save analysis to Supabase (tender_analysis table)
  upload PDFs to Supabase Storage (public bucket)
  save document metadata to Supabase (tender_documents table)
```

---

## API Endpoints Used

| Endpoint | Method | Params | Returns |
|---|---|---|---|
| `https://nhai.gov.in/nhai/api/tenderlist` | POST | `language=en`, `index=0`, `totalrecord=10000` | All tender IDs + basic fields |
| `https://nhai.gov.in/nhai/api/tenderdetail` | POST | `nid=<id>`, `language=en` | Full detail + document URLs |

**Key discovery:** The detail endpoint param is `nid` (not `id`). `nid` = the `id` field from the list response.

---

## Output: TenderAnalysis Sections

Every tender analysis produces these sections. All values carry `_source` citations with `page` number and verbatim `snippet`.

| Section | What It Contains |
|---|---|
| **KEY DATES** | Pre-bid meeting, clarification deadline, submission deadline, tech bid opening, financial bid opening, bid validity, doc download period |
| **RFP FEES** | RFP fee amount, payment mode, full bank details (A/C, IFSC, branch), EMD amount, performance security |
| **ELIGIBILITY — Technical** | Min annual turnover, similar project experience (lane/km/value), key personnel requirements, JV conditions, ongoing assignment cap |
| **ELIGIBILITY — Financial** | Min annual turnover, net worth, financial years considered |
| **EVALUATION CRITERIA** | Selection method (QCBS/QBS/LCS), technical weightage, financial weightage, min qualifying scores, per-criterion marks breakdown, pass/fail rules |
| **SCOPE OF RFP** | Project summary, in-scope tasks, out-of-scope/client obligations, deliverables, milestones with timelines, contract duration, project location (NH, chainage, states) |
| **SUBMISSION MECHANISMS** | Submission mode, portal, every required form with signing authority, certifications, annexures, number of copies, language |
| **INSTRUCTIONS TO BIDDERS** | Bidding overview, scope of work detail, clarification process, amendment process, disqualification conditions, conflict of interest rules |
| **CONTACT / SPOC** | Name, designation, department, full address, phone, email |
| **PAYMENT TERMS** | Per-milestone payment percentages and exact conditions |
| **RISK & REGULATORY** | Liquidated damages, force majeure, termination conditions, dispute resolution/arbitration, integrity pact, insurance requirements, penalty clauses |
| **DOCUMENTS & FORMS** | Every file with description, size, direct URL, Supabase storage path |

---

## Supabase Tables

### `tenders`
Stores raw metadata from NHAI API list + detail calls.

| Column | Type | Notes |
|---|---|---|
| `tender_id` | text PK | from API `id` field |
| `tender_no` | text | |
| `title` | text | |
| `publish_date` | text | |
| `submission_deadline` | text | |
| `bid_opening_date` | text | |
| `source_url` | text | |
| `status` | text | active / closed |
| `fetched_at` | timestamptz | |
| `raw_detail` | jsonb | full API response |

### `tender_analysis`
One row per tender. The `analysis` column is the full `TenderAnalysis` Pydantic model as JSON.

| Column | Type | Notes |
|---|---|---|
| `tender_id` | text PK → tenders | |
| `analysis` | jsonb | complete structured analysis |
| `analyzed_at` | timestamptz | |

### `tender_documents`
One row per file per tender.

| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `tender_id` | text → tenders | |
| `filename` | text | |
| `description` | text | e.g. "RFP", "NIT", "BOQ" |
| `url` | text | original NHAI URL |
| `filesize` | text | |
| `extension` | text | .pdf / .xlsx |
| `supabase_path` | text | `<tender_id>/<filename>` in storage |
| `is_form` | boolean | true for annexures/forms |
| `uploaded_at` | timestamptz | |

### Supabase Storage
- **Bucket name:** `tender-documents`
- **Visibility:** Public (so frontend can render PDFs inline)
- **Path format:** `<tender_id>/<filename>` e.g. `58050/RFP_787.pdf`

---

## Environment Variables

File: `nhai_v2/.env`

```env
# EYQ AI (already configured)
EYQ_INCUBATOR_ENDPOINT=https://eyq-incubator.asiapac.fabric.ey.com/eyq/as/api
EYQ_INCUBATOR_KEY=<your_key>

# Supabase (add these)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...   # service_role key (not anon key)
```

---

## Setup Steps

### 1. Install dependencies
```bash
cd nhai_v2
pip install -r requirements.txt
```

### 2. Create Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → API → copy **Project URL** and **service_role secret key**
3. Add both to `.env`

### 3. Run database migration
In Supabase dashboard → SQL Editor → paste and run:
```
migrations/001_schema.sql
```

### 4. Create Storage bucket
In Supabase dashboard → Storage → New Bucket
- Name: `tender-documents`
- Public: **Yes** (required for PDF preview in frontend)

---

## CLI Commands

All commands run from `nhai_v2/` directory:

```bash
cd /Users/krishchoudhary/GITHUB/SCRAPY/scrapy/nhai_v2
```

### Fetch all tenders from NHAI → Supabase
```bash
python cli.py fetch
```
Pulls up to 10,000 tenders. Upserts into `tenders` table.

```bash
python cli.py fetch --no-db          # just print, skip Supabase
python cli.py fetch --page-size 50   # limit fetch count
```

### View raw API detail for one tender
```bash
python cli.py detail 58050
```
Prints full JSON from `tenderdetail` API. Use to inspect doc URLs before analyzing.

### Analyze one tender (full pipeline)
```bash
python cli.py analyze 58050
```
Does: fetch detail → download all docs → extract PDF text → run AI → save to Supabase.
Takes **60–180 seconds** depending on PDF size and number of documents.

```bash
python cli.py analyze 58050 --no-upload   # skip uploading docs to Supabase Storage
```

### Analyze all un-analyzed tenders
```bash
python cli.py analyze-all
python cli.py analyze-all --limit 5       # process only 5
```
Each tender runs as subprocess so one failure doesn't stop the batch.

### Display analysis (formatted)
```bash
python cli.py show 58050                        # all sections
python cli.py show 58050 --section dates        # key dates only
python cli.py show 58050 --section fees         # RFP fees
python cli.py show 58050 --section elig         # eligibility criteria
python cli.py show 58050 --section eval         # evaluation criteria
python cli.py show 58050 --section scope        # scope of RFP
python cli.py show 58050 --section sub          # submission mechanisms
python cli.py show 58050 --section contact      # SPOC details
python cli.py show 58050 --section pay          # payment terms
python cli.py show 58050 --section risk         # risk & regulatory
python cli.py show 58050 --section doc          # documents & forms
python cli.py show 58050 --json                 # raw JSON output
```

### List all tenders
```bash
python cli.py list
python cli.py list --status active
python cli.py list --analyzed             # only analyzed tenders
```

### List documents for a tender
```bash
python cli.py docs 58050
```
Shows all files with their public Supabase Storage URLs (use for frontend PDF preview).

---

## Citation Format

Every extracted fact in the analysis carries:
```json
{
  "proposal_submission_deadline": "2026-05-14 at 11:00 hrs",
  "proposal_submission_deadline_source": [
    {
      "page": 5,
      "snippet": "The RFP will be invited through e-tendering portal... upto 11:00 hrs"
    }
  ]
}
```

Frontend can use `page` to scroll the embedded PDF to that page, and `snippet` to highlight the exact text.

---

## Tender Type Detection

The classifier scans the first 30 pages for signals:

| Type | Detection Signals |
|---|---|
| `2-stage` | "two stage", "RFQ", "shortlist", "pre-qualification", "Stage 1 / Stage 2" |
| `single-stage` | "single stage", "one stage", "techno-commercial", "combined bid" |
| `unknown` | neither found |

2-stage tenders have a separate shortlisting round before financial evaluation.
Single-stage tenders evaluate tech + financial together.

---

## Section → Page Mapping

The classifier finds which pages in the PDF contain each section, using keyword matching + ±1 page window. Example output from RFP_787.pdf (251 pages):

```
key_dates              → pages [12, 13, 14, 73, 74, 75]
rfp_fees               → pages [4, 5, 6, 18, 19, 20]
eligibility_technical  → pages [2, 3, 4, 5, 6, 7]
eligibility_financial  → pages [5, 6, 7, 8, 12, 13]
evaluation_criteria    → pages [4, 5, 6, 7, 8, 14]
scope_of_work          → pages [1, 2, 3, 4, 5, 6]
submission_format      → pages [1, 2, 3, 4, 5, 8]
contact_spoc           → pages [21, 22, 23, 24, 25, 26]
payment_terms          → pages [17, 18, 19, 82, 83, 84]
risk_regulatory        → pages [3, 4, 5, 6, 8, 9]
forms_annexures        → pages [1, 2, 3, 4, 5, 6]
```

Only those pages (up to `PDF_CHUNK_MAX_CHARS = 12,000` chars) are sent to the AI for each section — keeping token usage minimal and precision high.

---

## What Is Done

- [x] NHAI API integration (list + detail, `nid` param discovered)
- [x] Document downloader with local cache
- [x] PDF text extraction — page-by-page, citation-ready
- [x] Tender type classifier (2-stage vs single-stage)
- [x] Section → page mapper (12 sections, keyword + window)
- [x] Complete Pydantic schema (all sections, all subsections, all citations)
- [x] 9 section-specific AI prompts — zero-hallucination rules, exact quotes, page refs
- [x] AI analysis engine with per-section EYQ calls
- [x] Confidence scoring (low / medium / high)
- [x] Supabase DB layer (upsert tenders, analysis, document metadata)
- [x] Supabase Storage upload for documents
- [x] CLI with 7 commands + section filters + JSON output
- [x] Supabase SQL migration schema
- [x] Full pipeline tested end-to-end (API → download → extract → classify) ✅

---

## What Is Missing / TODO

### Must Do Before First Run
- [ ] **Add Supabase keys to `.env`** — `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`
- [ ] **Run `migrations/001_schema.sql`** in Supabase SQL editor
- [ ] **Create `tender-documents` storage bucket** (public) in Supabase dashboard
- [ ] **Test `python cli.py analyze 58050`** — first real end-to-end test with AI

### Known Gaps to Fix

- [ ] **EYQ model name** — `config.py` has `EYQ_MODEL = "gpt-4o"`. Verify the correct model name for the EYQ incubator endpoint (may be different)
- [ ] **XLSX parsing** — BOQ files (`.xlsx`) are downloaded but not parsed. Need `openpyxl` reader to extract financial data from BOQ sheets
- [ ] **Multi-document merge** — engine currently uses only the largest PDF as primary. Should merge NIT + RFP text for sections that span both docs
- [ ] **Section page window too broad** — some sections (e.g. forms_annexures) return pages 1–6 which is the table of contents, not actual forms. Need smarter keyword filtering for annexures
- [ ] **Forms detection** — `is_form` flag in `tender_documents` is never set to `true`. Need logic to detect form pages (pages with fill-in boxes, signature lines)
- [ ] **`analyze-all` needs `fetch` first** — if DB is empty, `analyze-all` finds nothing. Docs should make this clearer (run `fetch` first)
- [ ] **Closed/archived tenders** — currently only fetches active tenders. NHAI has an archive endpoint (`/#/tender-archive`) — not yet integrated
- [ ] **Rate limiting** — `analyze-all` hits AI API per section × per tender. No rate limit handling yet. Add exponential backoff for EYQ 429s
- [ ] **AI JSON repair** — if EYQ returns malformed JSON (partial response), engine logs error and returns empty section. Need a repair pass (strip trailing commas, fix truncation)

### Future (Phase 2 — Agentic)
- [ ] **Frontend dashboard** — React/Next.js with Supabase realtime, inline PDF preview with page jump, section navigation
- [ ] **Agentic re-analysis** — if confidence = low, agent re-runs with expanded page window
- [ ] **Cross-tender comparison** — compare eligibility criteria across similar tenders
- [ ] **Auto-alert** — notify when new tenders matching EY's profile appear
- [ ] **Corrigendum tracking** — detect and re-analyse when NHAI posts amendments
- [ ] **etenders.gov.in integration** — second source for cross-referencing

---

## File Locations Quick Reference

| File | Purpose |
|---|---|
| `nhai_v2/cli.py` | Run everything from here |
| `nhai_v2/config.py` | Change API endpoints, chunk sizes, timeouts |
| `nhai_v2/.env` | Add Supabase keys here |
| `nhai_v2/api/nhai.py` | NHAI API calls |
| `nhai_v2/api/documents.py` | Document download logic |
| `nhai_v2/extraction/pdf.py` | PDF text extraction, `ExtractedDocument` class |
| `nhai_v2/extraction/classifier.py` | Section keywords, tender type signals — tune here |
| `nhai_v2/analysis/schema.py` | All output fields — add new fields here |
| `nhai_v2/analysis/prompts.py` | AI prompts — tune for accuracy here |
| `nhai_v2/analysis/engine.py` | Main orchestrator — section extraction flow |
| `nhai_v2/db/supabase.py` | All DB operations |
| `nhai_v2/migrations/001_schema.sql` | Run once in Supabase |
| `nhai_v2/documents/<tender_id>/` | Downloaded PDFs cached here |

---

## Accuracy Notes

- AI temperature is set to `0.0` — deterministic, no creative hallucination
- System prompt forbids inference: "Never invent, infer, or assume data not present in the text"
- Every value requires a verbatim snippet ≤200 chars from the exact source page
- Pydantic validates every AI response — malformed sections fall back to empty defaults, never crash
- Confidence score is calculated from how many key fields were actually populated (not inferred)

---

*NHAI Tender Intelligence System v2 — EY AI Incubator — May 2026*
