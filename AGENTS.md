# AI Agent Guide — Prospeo CLI

> This file helps AI agents (Claude, GPT, Gemini, open-source models) install, authenticate, and use the Prospeo CLI to enrich persons and companies, search for leads, and access verified B2B contact data from a 200M+ person and 30M+ company database.

## Quick Start

```bash
# Install globally
npm install -g prospeo-cli

# Authenticate (non-interactive — best for agents)
export PROSPEO_API_KEY="your-api-key-here"

# Verify it works
prospeo account info
```

**Requirements:** Node.js 18+

---

## Authentication

```bash
# 1. Environment variable (recommended for agents)
export PROSPEO_API_KEY="your-api-key-here"

# 2. Per-command flag
prospeo person enrich --linkedin-url "..." --api-key "your-api-key-here"

# 3. Interactive login (stores in ~/.prospeo/config.json)
prospeo login
```

Get your API key: https://prospeo.io/dashboard/api

---

## Output Format

All commands output **JSON to stdout** by default:

```bash
# Compact JSON (default — best for piping to tools)
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe"

# Pretty-printed JSON (best when reading yourself)
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --pretty

# Select specific top-level fields
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --fields person,company

# Suppress output (exit code only — 0=success, 1=error)
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --quiet
```

**Exit codes:** 0 = success, 1 = error. Errors always go to stderr as JSON:
```json
{"error":"No API key found.","code":"AUTH_ERROR"}
```

---

## Discovering Commands

```bash
prospeo --help                    # all groups
prospeo person --help             # subcommands in group
prospeo person enrich --help      # flags + examples for one command
```

---

## All Commands

### person — Enrich and search people (200M+ contacts)

```
enrich        Enrich a single person — email, mobile, job history, company data
bulk-enrich   Enrich up to 50 persons in one request
search        Search persons with 30+ filters
```

### company — Enrich and search companies (30M+ companies)

```
enrich        Enrich a single company — 50+ data points
bulk-enrich   Enrich up to 50 companies in one request
search        Search companies with filters
```

### suggestions — Free autocomplete, no credits consumed

```
location    Autocomplete location strings for search filters
job-title   Autocomplete job title strings for search filters
```

### account

```
info   Plan, remaining credits, used credits, quota renewal date
```

---

## Workflows

### 1. Enrich a person by LinkedIn URL

```bash
prospeo person enrich \
  --linkedin-url "https://linkedin.com/in/jdoe" \
  --pretty
```

### 2. Enrich a person by name + company domain

```bash
prospeo person enrich \
  --first-name "Eva" \
  --last-name "Kiegler" \
  --company-website "intercom.com"
```

### 3. Enrich a person by email

```bash
prospeo person enrich --email "john@acme.com" --pretty
```

### 4. Enrich a person and include mobile (10 credits)

```bash
prospeo person enrich \
  --linkedin-url "https://linkedin.com/in/jdoe" \
  --enrich-mobile \
  --only-verified-mobile \
  --pretty
```

### 5. Enrich a company by domain

```bash
prospeo company enrich --website "stripe.com" --pretty
```

### 6. Enrich a company by LinkedIn URL

```bash
prospeo company enrich --linkedin-url "https://linkedin.com/company/stripe" --pretty
```

### 7. Bulk enrich persons (preferred over multiple single calls)

```bash
prospeo person bulk-enrich \
  --data '[
    {"identifier":"lead_001","linkedin_url":"https://linkedin.com/in/person1"},
    {"identifier":"lead_002","email":"jane@stripe.com"},
    {"identifier":"lead_003","first_name":"John","last_name":"Doe","company_website":"acme.com"}
  ]' \
  --only-verified-email \
  --pretty
```

### 8. Bulk enrich companies

```bash
prospeo company bulk-enrich \
  --data '[
    {"identifier":"c1","company_website":"intercom.com"},
    {"identifier":"c2","company_linkedin_url":"https://linkedin.com/company/stripe"},
    {"identifier":"c3","company_website":"hubspot.com"}
  ]' \
  --pretty
```

### 9. Search for VP/C-Suite sales leaders at software companies

```bash
prospeo person search \
  --filters '{
    "person_seniority": {"include": ["Vice President", "C-Suite"]},
    "person_department": {"include": ["Sales"]},
    "company_industry": {"include": ["Software Development", "Technology Information and Internet"]}
  }' \
  --pretty
```

### 10. Search for Director-level engineers at Series A/B startups

```bash
prospeo person search \
  --filters '{
    "person_seniority": {"include": ["Director", "Manager"]},
    "person_department": {"include": ["Engineering & Technical"]},
    "company_funding": {"stage": ["Series A", "Series B"]},
    "company_employee_range": {"include": ["51-100", "101-200", "201-500"]}
  }' \
  --pretty
```

### 11. Search for companies by domain list (up to 500)

```bash
prospeo company search \
  --filters '{
    "company": {"websites": ["stripe.com", "brex.com", "ramp.com", "mercury.com"]}
  }' \
  --pretty
```

### 12. Search Series A/B companies in the US with 51–200 employees

```bash
prospeo company search \
  --filters '{
    "company_funding": {"stage": ["Series A", "Series B"]},
    "company_location": {"include": ["United States"]},
    "company_employee_range": {"include": ["51-100", "101-200"]}
  }' \
  --pretty
```

### 13. Get exact location strings for search filters

```bash
# ALWAYS run this before using a location in search — strings must be exact
prospeo suggestions location --query "new york"
# → [{"name":"New York, United States","type":"STATE"},{"name":"New York City, New York, United States","type":"CITY"},{"name":"Greater New York City Area","type":"ZONE"}]

# Then use the exact "name" value in filters:
prospeo person search \
  --filters '{"person_location": {"include": ["New York City, New York, United States"]}}' \
  --pretty
```

### 14. Get exact job title strings

```bash
prospeo suggestions job-title --query "chief revenue"
# → ["Chief Revenue Officer","VP of Revenue","SVP Revenue Operations",...]

# Use in filters:
prospeo person search \
  --filters '{"person_job_title": {"include": ["Chief Revenue Officer", "VP of Sales"]}}' \
  --pretty
```

### 15. Paginate through search results

```bash
# Check total pages from first response: pagination.total_page
prospeo person search --filters '{"person_seniority":{"include":["Director"]}}' --page 1
prospeo person search --filters '{"person_seniority":{"include":["Director"]}}' --page 2
# Max 1000 pages × 25 results = 25,000 results per query
```

### 16. Check credits before a large operation

```bash
prospeo account info --pretty
# → {"current_plan":"GROWTH","remaining_credits":4850,"used_credits":150,"next_quota_renewal_days":12,"next_quota_renewal_date":"2025-07-01T00:00:00Z"}
```

---

## Credit Costs

| Operation | Credits |
|-----------|---------|
| `person enrich` | 1 |
| `person enrich --enrich-mobile` | 10 |
| `person bulk-enrich` (per matched person) | 1 or 10 |
| `person search` (per page with ≥1 result) | 1 |
| `company enrich` | 1 |
| `company bulk-enrich` (per matched company) | 1 |
| `company search` (per page with ≥1 result) | 1 |
| `suggestions location` | **Free** |
| `suggestions job-title` | **Free** |
| `account info` | **Free** |
| Re-enriching same record (account lifetime) | **Free** |

---

## Search Filter Reference

### Person Search — all filter keys

```json
{
  "person_seniority": {
    "include": ["Vice President", "C-Suite", "Director"],
    "exclude": ["Intern", "Entry"]
  },
  "person_department": {
    "include": ["Sales", "Engineering & Technical", "Marketing"]
  },
  "person_job_title": {
    "include": ["Head of Sales", "VP of Engineering", "Chief Revenue Officer"]
  },
  "person_location": {
    "include": ["United States", "California", "New York City, New York, United States"]
  },
  "person_year_of_experience": { "min": 5, "max": 20 },
  "company_industry": {
    "include": ["Software Development", "Financial Services"],
    "exclude": ["Staffing and Recruiting"]
  },
  "company_location": {
    "include": ["United States", "Greater New York City Area"]
  },
  "company_employee_range": {
    "include": ["51-100", "101-200", "201-500"]
  },
  "company": {
    "websites": { "include": ["stripe.com", "brex.com"] },
    "names": { "include": ["Stripe", "Brex"] }
  }
}
```

### Company Search — all filter keys

```json
{
  "company_industry": {
    "include": ["Software Development", "Financial Services"],
    "exclude": ["Staffing and Recruiting"]
  },
  "company_location": {
    "include": ["United States", "California"]
  },
  "company_employee_range": {
    "include": ["51-100", "101-200", "201-500"]
  },
  "company_funding": {
    "stage": ["Series A", "Series B", "Series C"],
    "last_funding": { "min": 1000000, "max": 50000000 },
    "total_funding": { "min": 5000000 }
  },
  "company": {
    "websites": { "include": ["stripe.com", "brex.com", "ramp.com"] },
    "names": { "include": ["Stripe", "Brex"] }
  }
}
```

**Rules:**
- Cannot search with ONLY exclude filters — always include at least one `include` filter
- `company_websites` / `company_names` max 500 items per request
- Location and job title strings must match exactly — use `suggestions` commands to look them up

---

## Enum Reference

### Seniority values
```
"Founder/Owner"  "C-Suite"  "Partner"  "Vice President"  "Head"
"Director"  "Manager"  "Senior"  "Entry"  "Intern"
```

### Department values
```
"C-Suite"                 "Sales"                    "Engineering & Technical"
"Marketing"               "Finance"                  "Human Resources"
"Information Technology"  "Legal"                    "Operations"
"Product"                 "Design"                   "Consulting"
"Medical & Health"        "Education & Coaching"
```
*Submitting a parent department (e.g. "Engineering & Technical") automatically includes all sub-departments.*

### Employee range values
```
"1-10"  "11-20"  "21-50"  "51-100"  "101-200"  "201-500"
"501-1000"  "1001-2000"  "2001-5000"  "5001-10000"  "10000+"
```

### Funding stage values
```
"Pre seed"       "Seed"             "Series A"          "Series B"
"Series C"       "Series D"         "Series E-J"        "Angel"
"Grant"          "Private equity"   "Debt financing"    "Convertible note"
"Corporate round"  "Post IPO equity"  "Post IPO debt"   "Equity crowdfunding"
"Product crowdfunding"  "Secondary market"  "Initial coin offering"
"Non equity assistance"  "Undisclosed"  "Other event"
```

### Location types (from suggestions endpoint)
```
COUNTRY  → e.g. "United States", "France", "Germany"
STATE    → e.g. "California", "New York", "Ontario"
CITY     → e.g. "San Francisco, California, United States"
ZONE     → e.g. "Greater San Francisco Bay Area", "Greater New York City Area"
```

---

## Response Shapes

### `person enrich` / `person bulk-enrich` (single match)

```json
{
  "error": false,
  "free_enrichment": false,
  "person": {
    "person_id": "abc123",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "current_job_title": "VP of Sales",
    "headline": "VP of Sales at Acme Corp",
    "linkedin_url": "https://linkedin.com/in/jdoe",
    "linkedin_member_id": "12345678",
    "email": {
      "email": "john@acme.com",
      "status": "VERIFIED"
    },
    "mobile": {
      "status": "NOT_ENRICHED"
    },
    "location": {
      "country": "United States",
      "state": "California",
      "city": "San Francisco",
      "timezone": "America/Los_Angeles"
    },
    "job_history": [
      {
        "company_name": "Acme Corp",
        "job_title": "VP of Sales",
        "start_date": "2021-01",
        "end_date": null,
        "current": true
      }
    ],
    "skills": ["SaaS", "B2B Sales", "CRM"]
  },
  "company": {
    "company_id": "cccc123",
    "name": "Acme Corp",
    "website": "acme.com",
    "domain": "acme.com",
    "description": "Acme Corp builds...",
    "industry": "Software Development",
    "type": "PRIVATE",
    "employee_count": 150,
    "employee_range": "101-200",
    "location": {
      "country": "United States",
      "state": "California",
      "city": "San Francisco"
    },
    "founded": 2015,
    "revenue_range": "$10M-$50M",
    "funding": {
      "total_funding": 25000000,
      "last_funding_amount": 15000000,
      "last_funding_date": "2022-06",
      "last_funding_stage": "Series B"
    },
    "technology": ["Salesforce", "HubSpot", "AWS"],
    "linkedin_url": "https://linkedin.com/company/acme-corp",
    "twitter_url": "https://twitter.com/acmecorp"
  }
}
```

### `person bulk-enrich` response

```json
{
  "error": false,
  "total_cost": 2,
  "matched": [
    {
      "identifier": "lead_001",
      "person": { "..." : "..." },
      "company": { "..." : "..." }
    }
  ],
  "not_matched": ["lead_002"],
  "invalid_datapoints": ["lead_003"]
}
```

`not_matched` = valid data, but no record found in database
`invalid_datapoints` = insufficient data to search (e.g. only company_name with no other identifiers)

### `person search` / `company search` response

```json
{
  "error": false,
  "results": [
    {
      "person": { "..." : "..." },
      "company": { "..." : "..." }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 25,
    "total_page": 40,
    "total_count": 1000
  }
}
```

Note: search results do NOT include email or mobile — use `person enrich` or `person bulk-enrich` to get those after searching.

### `account info` response

```json
{
  "error": false,
  "current_plan": "GROWTH",
  "remaining_credits": 4850,
  "used_credits": 150,
  "current_team_members": 1,
  "next_quota_renewal_days": 12,
  "next_quota_renewal_date": "2025-07-01T00:00:00Z"
}
```

### `suggestions location` response

```json
{
  "error": false,
  "location_suggestions": [
    { "name": "New York, United States", "type": "STATE" },
    { "name": "New York City, New York, United States", "type": "CITY" },
    { "name": "Greater New York City Area", "type": "ZONE" }
  ],
  "job_title_suggestions": null
}
```

### `suggestions job-title` response

```json
{
  "error": false,
  "location_suggestions": null,
  "job_title_suggestions": [
    "Chief Revenue Officer",
    "VP of Revenue",
    "SVP Revenue Operations"
  ]
}
```

---

## Error Codes

| Code | HTTP | Meaning | Fix |
|------|------|---------|-----|
| `AUTH_ERROR` | 401 | Invalid or missing API key | Check `PROSPEO_API_KEY` or run `prospeo login` |
| `INSUFFICIENT_CREDITS` | 400 | Account depleted | Add credits at prospeo.io |
| `NO_MATCH` | 400 | No record found for provided data | Add more datapoints |
| `NO_RESULTS` | 400 | Search returned 0 results | Loosen filters |
| `RATE_LIMIT` | 429 | Too many requests | CLI retries automatically |
| `VALIDATION_ERROR` | 400 | Bad request format | Check `--help` for required fields |
| `INVALID_FILTERS` | 400 | Filter config not supported | Check filter JSON structure |
| `INVALID_DATAPOINTS` | 400 | Insufficient identification data | Add linkedin_url, email, or name+company |

---

## Rate Limits

Rate limits depend on your plan. The API returns these headers with every response:
- `x-daily-request-left` / `x-daily-rate-limit`
- `x-minute-request-left` / `x-minute-rate-limit`
- `x-second-rate-limit`

The CLI automatically retries on 429 with exponential backoff — no need to handle this yourself.

Suggestions endpoint: 15 requests/second across all plans.

---

## MCP Server

```bash
prospeo mcp
```

MCP config for Claude Desktop / Cursor / VS Code:

```json
{
  "mcpServers": {
    "prospeo": {
      "command": "npx",
      "args": ["prospeo-cli", "mcp"],
      "env": {
        "PROSPEO_API_KEY": "your-api-key"
      }
    }
  }
}
```

If installed globally (`npm install -g prospeo-cli`):

```json
{
  "mcpServers": {
    "prospeo": {
      "command": "prospeo",
      "args": ["mcp"],
      "env": {
        "PROSPEO_API_KEY": "your-api-key"
      }
    }
  }
}
```

**MCP tools registered:** `person_enrich`, `person_bulk_enrich`, `person_search`, `company_enrich`, `company_bulk_enrich`, `company_search`, `suggestions_location`, `suggestions_job_title`, `account_info`

---

## Tips for AI Agents

1. **`linkedin_url` is the strongest person identifier** — use it whenever available; name+company is a fallback
2. **`company_website` is the strongest company identifier** — never rely on `company_name` alone
3. **Use `bulk-enrich` over looping `enrich`** — same credit cost, one round-trip, up to 50 records
4. **Search does NOT return email/mobile** — search to build a list, then bulk-enrich to get contact data
5. **Always use `suggestions` before searching by location or job title** — strings must match exactly
6. **Check `pagination.total_page`** on first search response to know how many pages exist
7. **Check `account info` before large bulk operations** to confirm sufficient credits
8. **`free_enrichment: true`** means re-enrichment of a previously seen record — no credit charged
9. **`not_matched` ≠ error** — it means the record is valid but not in the database; try more datapoints
10. **Rate limits are handled automatically** — exponential backoff on 429, no sleep needed
11. **`--fields`** reduces output noise: e.g. `--fields person` to get just the person object
12. **Combine filters for precision** — seniority + department + location + industry narrows well
13. **Search returns max 25,000 results** (1000 pages × 25) — narrow filters if you need more precision
