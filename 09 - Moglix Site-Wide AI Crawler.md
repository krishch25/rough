# Moglix Site-Wide AI Crawler — Comprehensive Project Report

**Project Name:** Moglix Site-Wide AI-Directed Distributed Crawler  
**Developer:** Krish Choudhary  
**Organization:** Ernst & Young — AI Incubator Division  
**Date:** April 2026  
**Status:** Active Development  
**Source Location:** `/Users/krishchoudhary/GITHUB/SCRAPY/scrapy/moglix_site_crawler/`

---

## 1. Executive Summary

While WebScrapy scrapes individual Moglix category URLs, this system is designed to crawl the **entire Moglix.com marketplace** using a **distributed, queue-based, multi-worker architecture**. Five independent Python worker processes coordinate through Supabase PostgreSQL as a distributed task queue: an Enqueue Worker discovers all categories, a Listing Worker scrapes listing pages, a Repair Worker re-fetches failed pages, an AI Director Worker uses multi-strategy regex extraction to find product URLs, and an AI Factory Adapter enriches product data using LLMs. The system is horizontally scalable — run multiple instances of any worker.

---

## 2. Source Structure

```
moglix_site_crawler/
├── run_enqueue_listing_tasks.py     # 1,625 bytes — Discover & enqueue all categories
├── run_listing_queue_worker.py      # 4,423 bytes — Scrape listing pages from queue
├── run_repair_worker.py             # 2,763 bytes — Re-fetch failed listings
├── run_ai_director_worker.py        # 7,623 bytes — Multi-strategy product extraction
├── run_ai_factory_adapter.py        # 11,403 bytes — LLM-powered data enrichment
├── requirements.txt                 # supabase, scrapy, etc.
├── scrapy.cfg                       # Scrapy config
├── .env.example                     # SUPABASE_URL, SUPABASE_KEY
├── sql/                             # Database migration scripts
└── moglix_site_crawler/             # Scrapy project
    ├── settings.py
    ├── middlewares.py
    ├── pipelines.py
    └── spiders/
        └── listing_spider.py
```

---

## 3. Worker Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  Worker 1: ENQUEUE                                           │
│  run_enqueue_listing_tasks.py                                │
│  → Scrape Moglix header for all category URLs                │
│  → INSERT INTO moglix_listing_pages (status='pending')       │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Worker 2: LISTING SCRAPER                                   │
│  run_listing_queue_worker.py                                 │
│  → SELECT ... WHERE status='pending' LIMIT 10                │
│  → UPDATE status='scraping' (atomic claim)                   │
│  → Scrapy spider: fetch listing page HTML                    │
│  → Count products found vs expected                          │
│  → UPDATE status='scraped' or 'needs_repair'                 │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Worker 3: REPAIR                                            │
│  run_repair_worker.py                                        │
│  → SELECT ... WHERE status='needs_repair'                    │
│  → Re-fetch with different User-Agent, Playwright, etc.      │
│  → Store repaired HTML in moglix_repair_tasks                │
│  → UPDATE status='repaired'                                  │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Worker 4: AI DIRECTOR                                       │
│  run_ai_director_worker.py                                   │
│  → SELECT ... WHERE status='repaired'                        │
│  → Run 2 extraction strategies on HTML                       │
│  → Choose best strategy (closest to expected count)          │
│  → UPSERT products into moglix_products_raw                  │
│  → UPDATE status='repaired_ok' or 'needs_repair' (loop)     │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Worker 5: AI FACTORY ADAPTER                                │
│  run_ai_factory_adapter.py                                   │
│  → Take raw product URLs from moglix_products_raw            │
│  → Use LLM to extract structured product data                │
│  → Store enriched data                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. AI Director — Multi-Strategy Product Extraction

**Source:** `run_ai_director_worker.py` (219 lines)

This is the most sophisticated component. It implements two independent extraction strategies and automatically selects the best one:

### Strategy 1: HTML Anchor Regex
```python
def _extract_mp_urls_from_html(html):
    # Absolute URLs
    urls = re.findall(r"https?://www\.moglix\.com/[^\"']+/mp/[^\"']+", html)
    # Relative URLs (fallback)
    if not urls:
        rel = re.findall(r'href=[\"\'](/[^\"\']+/mp/[^\"\']+)[\"\']]', html)
        urls = [BASE_URL + r for r in rel]
    return deduplicate(urls)
```

### Strategy 2: JSON ProductURL Regex
```python
def _extract_product_urls_from_json_like(html):
    # Extract from embedded JSON payloads in Angular HTML
    rels = re.findall(r'"productUrl"\s*:\s*"([^"]+)"', html)
    urls = [BASE_URL + r if r.startswith("/") else r for r in rels]
    return deduplicate(urls)
```

### Strategy Selection Algorithm
```python
def _choose_strategy(expected_on_page, html):
    mp_urls = _extract_mp_urls_from_html(html)         # Strategy 1
    json_urls = _extract_product_urls_from_json_like(html)  # Strategy 2
    
    candidates = [("html_mp_regex", mp_urls), ("json_productUrl_regex", json_urls)]
    
    if expected_on_page is None or expected_on_page <= 0:
        # No expectation: pick whichever found more
        return max(candidates, key=lambda x: len(x[1]))
    
    # Pick closest to expected count
    return min(candidates, key=lambda x: abs(len(x[1]) - expected_on_page))
```

### Quality Gate
```python
ACCEPT_RATIO = 0.95  # Must find >= 95% of expected products

accept = extracted_count >= int(expected_on_page * ACCEPT_RATIO)
new_status = "repaired_ok" if accept else "needs_repair"  # Loops back if insufficient
```

### Product Name Extraction
```python
def _extract_product_names_near_mp(html, limit=200):
    # Extract anchor text near /mp/ links
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+/mp/[^"\']+)["\'][^>]*>(.*?)</a>', html):
        href = m.group(1)
        inner = re.sub(r"<[^>]+>", " ", m.group(2))  # Strip inner HTML tags
        text = re.sub(r"\s+", " ", inner).strip()
        if len(text) >= 4:
            mapping[href] = text
    return mapping
```

---

## 5. Database Schema (Supabase)

```sql
CREATE TABLE moglix_listing_pages (
    category_url TEXT NOT NULL,
    page_number INT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending|scraping|scraped|needs_repair|repaired_ok
    html TEXT,
    expected_on_page INT,
    director_strategy_id TEXT,
    director_extracted_count INT,
    director_candidate_counts JSONB,
    PRIMARY KEY (category_url, page_number)
);

CREATE TABLE moglix_repair_tasks (
    category_url TEXT NOT NULL,
    page_number INT NOT NULL,
    status TEXT DEFAULT 'pending',
    repaired_html_truncated TEXT,
    repaired_html TEXT,
    repair_error TEXT,
    director_strategy_id TEXT,
    director_extracted_count INT,
    PRIMARY KEY (category_url, page_number)
);

CREATE TABLE moglix_products_raw (
    product_url TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT,
    category_url TEXT,
    listing_page INT,
    source_url TEXT,
    director_strategy_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Environment Configuration

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
MOG_DIRECTOR_WORKER_LIMIT=10    # Tasks per batch
MOG_DIRECTOR_WORKER_ID=director_worker
MOG_REPAIR_ACCEPT_RATIO=0.95    # Quality threshold
```

---

## 7. Effects

| Metric | WebScrapy (Single-Process) | Site-Wide Crawler |
|--------|:-------------------------:|:-----------------:|
| Coverage | One category at a time | **Entire Moglix platform** |
| Scalability | 3 parallel browsers | **Horizontally scalable workers** |
| Failure handling | Stop on error | **Auto-repair loop** |
| Task coordination | In-process | **Distributed Supabase queue** |
| Strategy selection | Single approach | **Multi-strategy + quality gate** |

---

*Report prepared for the EY AI Incubator Internship — April 2026*
