# AI Agent Guide — Prospeo CLI

> This file helps AI agents (Claude, GPT, Gemini, open-source models) install, authenticate, and use the Prospeo CLI to enrich persons and companies, search for leads, and access verified contact data.

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

## Authentication

Prospeo uses a simple API key passed as an HTTP header. Provide your key via:

```bash
# 1. Environment variable (recommended for agents)
export PROSPEO_API_KEY="your-api-key-here"

# 2. Per-command flag
prospeo person enrich --linkedin-url "..." --api-key "your-api-key-here"

# 3. Interactive login (stores in ~/.prospeo/config.json)
prospeo login
```

Get your API key: https://prospeo.io/dashboard/api

## Output Format

All commands output **JSON to stdout** by default:

```bash
# Default: compact JSON
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe"

# Pretty-printed JSON
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --pretty

# Select specific fields
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --fields person,company

# Suppress output (exit code only)
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --quiet
```

**Exit codes:** 0 = success, 1 = error. Errors go to stderr as JSON:
```json
{"error":"No API key found.","code":"AUTH_ERROR"}
```

## Discovering Commands

```bash
# List all command groups
prospeo --help

# List subcommands in a group
prospeo person --help

# Get help for a specific subcommand
prospeo person enrich --help
```

## All Command Groups & Subcommands

### person
Enrich and search people (200M+ contacts).

```
enrich        Enrich a single person — returns email, mobile, job history, company data
bulk-enrich   Enrich up to 50 persons in one request
search        Search persons with 30+ filters (seniority, title, industry, location, etc.)
```

### company
Enrich and search companies (30M+ companies).

```
enrich        Enrich a single company — 50+ data points including funding, tech stack, headcount
bulk-enrich   Enrich up to 50 companies in one request
search        Search companies with filters (industry, location, funding, employee range, etc.)
```

### suggestions
Free autocomplete — no credits consumed.

```
location    Get location autocomplete for use in search filters
job-title   Get job title autocomplete for use in search filters
```

### account
```
info   View plan, remaining credits, used credits, and quota renewal date
```

---

## Common Workflows for Agents

### Enrich a person by LinkedIn URL

```bash
prospeo person enrich \
  --linkedin-url "https://linkedin.com/in/jdoe" \
  --pretty
```

### Enrich a person by name + company

```bash
prospeo person enrich \
  --first-name "Eva" \
  --last-name "Kiegler" \
  --company-website "intercom.com"
```

### Enrich with mobile number (10 credits)

```bash
prospeo person enrich \
  --linkedin-url "https://linkedin.com/in/jdoe" \
  --enrich-mobile \
  --only-verified-mobile \
  --pretty
```

### Enrich a company by domain

```bash
prospeo company enrich --website "stripe.com" --pretty
```

### Search for VP-level sales leaders at SaaS companies

```bash
prospeo person search \
  --filters '{"person_seniority":{"include":["VP","C_SUITE"]},"person_job_title":["Head of Sales","VP of Sales","Chief Revenue Officer"],"company_industry":{"include":["TECHNOLOGY"]}}' \
  --pretty
```

### Search for Series A/B companies in the US with 51–200 employees

```bash
prospeo company search \
  --filters '{"company_funding":{"stage":["SERIES_A","SERIES_B"]},"company_location":["United States"],"company_employee_range":{"include":["51_200"]}}' \
  --pretty
```

### Paginate through search results

```bash
# Page 1
prospeo person search --filters '{"person_seniority":{"include":["DIRECTOR"]}}' --page 1

# Page 2
prospeo person search --filters '{"person_seniority":{"include":["DIRECTOR"]}}' --page 2
```

### Bulk enrich 3 persons in one request

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

### Bulk enrich companies

```bash
prospeo company bulk-enrich \
  --data '[
    {"identifier":"c1","company_website":"intercom.com"},
    {"identifier":"c2","company_linkedin_url":"https://linkedin.com/company/stripe"},
    {"identifier":"c3","company_website":"hubspot.com"}
  ]' \
  --pretty
```

### Find valid location strings for search filters

```bash
# What location strings can I use for "New York"?
prospeo suggestions location --query "new york"
# → returns: "New York", "New York City", "Greater New York City Area", etc.

# Then use exact string in search:
prospeo person search \
  --filters '{"person_location":["New York City, New York, United States"]}' \
  --pretty
```

### Find valid job title strings

```bash
prospeo suggestions job-title --query "chief revenue"
# → returns: "Chief Revenue Officer", "VP of Revenue", etc.
```

### Check remaining credits

```bash
prospeo account info --pretty
# → {"current_plan":"GROWTH","remaining_credits":4850,"used_credits":150,...}
```

---

## Credit Costs

| Operation | Credits |
|-----------|---------|
| person enrich (email + company) | 1 |
| person enrich + mobile | 10 |
| person bulk-enrich (per matched person) | 1 or 10 |
| person search (per page with results) | 1 |
| company enrich | 1 |
| company bulk-enrich (per matched company) | 1 |
| company search (per page with results) | 1 |
| suggestions (location/job-title) | Free |
| account info | Free |
| Re-enriching same record (lifetime) | Free |

---

## Search Filter Reference

### Person Search Filters (`prospeo person search --filters '...'`)

```json
{
  "person_seniority": {
    "include": ["C_SUITE", "VP", "DIRECTOR", "MANAGER", "SENIOR", "ENTRY"],
    "exclude": ["INTERN"]
  },
  "person_job_title": ["Head of Sales", "VP of Engineering"],
  "person_department": {
    "include": ["SALES", "ENGINEERING", "MARKETING", "FINANCE", "HR", "OPERATIONS", "LEGAL", "PRODUCT", "DESIGN", "CUSTOMER_SUCCESS"]
  },
  "person_location": ["United States", "California", "New York City, New York, United States"],
  "person_year_of_experience": { "min": 5, "max": 20 },
  "company_industry": {
    "include": ["TECHNOLOGY", "FINTECH", "HEALTHCARE", "SAAS"],
    "exclude": ["STAFFING"]
  },
  "company_location": ["United States", "Greater New York City Area"],
  "company_employee_range": {
    "include": ["11_50", "51_200", "201_500", "501_1000", "1001_5000"]
  },
  "company_websites": ["stripe.com", "brex.com"],
  "company_names": ["Stripe", "Brex"]
}
```

**Important:** Use `prospeo suggestions location` and `prospeo suggestions job-title` to get exact values. You cannot search with ONLY exclude filters — always include at least one include filter.

### Company Search Filters (`prospeo company search --filters '...'`)

```json
{
  "company_industry": {
    "include": ["TECHNOLOGY", "FINTECH"],
    "exclude": ["CONSULTING"]
  },
  "company_location": ["United States", "California"],
  "company_employee_range": {
    "include": ["51_200", "201_500"]
  },
  "company_funding": {
    "stage": ["SERIES_A", "SERIES_B", "SERIES_C"],
    "last_funding": { "min": 1000000, "max": 50000000 },
    "total_funding": { "min": 5000000 }
  },
  "company": {
    "websites": ["stripe.com", "brex.com"],
    "names": ["Stripe", "Brex"]
  }
}
```

---

## Response Shapes

### Person Enrich Response
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
    "email": {
      "email": "john@acme.com",
      "status": "VERIFIED"
    },
    "mobile": { "status": "NOT_ENRICHED" },
    "location": { "country": "United States", "state": "California", "city": "San Francisco" },
    "skills": ["SaaS", "B2B Sales"]
  },
  "company": {
    "company_id": "cccc123",
    "name": "Acme Corp",
    "website": "acme.com",
    "domain": "acme.com",
    "employee_count": 150,
    "industry": "Technology",
    "funding": { "total_funding": 25000000 }
  }
}
```

### Bulk Enrich Response
```json
{
  "error": false,
  "total_cost": 2,
  "matched": [
    { "identifier": "lead_001", "person": {...}, "company": {...} }
  ],
  "not_matched": ["lead_002"],
  "invalid_datapoints": ["lead_003"]
}
```

### Search Response
```json
{
  "error": false,
  "results": [
    { "person": {...}, "company": {...} }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 25,
    "total_page": 40,
    "total_count": 1000
  }
}
```

---

## Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `AUTH_ERROR` | Invalid or missing API key | Check `PROSPEO_API_KEY` or run `prospeo login` |
| `INSUFFICIENT_CREDITS` | Account depleted | Add credits at prospeo.io |
| `NO_MATCH` | No match found for provided data | Try more datapoints |
| `RATE_LIMIT` | Too many requests | CLI retries automatically with backoff |
| `VALIDATION_ERROR` | Bad request format | Check `--help` for required fields |
| `INVALID_FILTERS` | Filter config not supported | Check filter JSON structure |

---

## MCP Server (for Claude, Cursor, VS Code)

The CLI includes a built-in MCP server exposing all commands as tools:

```bash
prospeo mcp
```

MCP config for Claude Desktop / Cursor:
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

Or if installed globally:
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

1. **Always `--pretty`** when reading output yourself; use compact JSON when piping to tools
2. **Use suggestions first** — before searching by location or job title, run `suggestions location` / `suggestions job-title` to get exact strings
3. **Prefer `bulk-enrich`** over multiple single `enrich` calls — it's faster and uses the same credits
4. **Check `account info`** before large bulk operations to confirm you have enough credits
5. **Pagination** — search returns 25 results/page; check `pagination.total_page` to know how many pages exist
6. **`free_enrichment: true`** means a re-enrich of a previously seen record — no charge
7. **`not_matched` vs `invalid_datapoints`** — `not_matched` means the data is valid but no result found; `invalid_datapoints` means the data was insufficient to search
8. **Rate limits** are handled automatically with exponential backoff — no need to add sleep
9. **linkedin_url is the strongest identifier** for person enrichment — use it when available
10. **company_website is the strongest identifier** for company enrichment — use it over company_name alone
