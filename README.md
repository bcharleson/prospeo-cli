# prospeo-cli

> CLI and MCP server for the [Prospeo API](https://prospeo.io) — person/company enrichment and search for AI agents and developers.

```bash
npm install -g prospeo-cli
```

## What it does

- **Enrich persons** — email, mobile, job history, LinkedIn, and full company data from a name, email, or LinkedIn URL
- **Enrich companies** — 50+ data points: funding, tech stack, headcount, location, job postings, social URLs
- **Search persons** — 200M+ contacts with 30+ filters: seniority, department, job title, location, industry, and more
- **Search companies** — 30M+ companies with filters: industry, location, funding stage, employee count, and more
- **Dual CLI + MCP** — every command works as a terminal command AND as an MCP tool for Claude, Cursor, VS Code
- **Agent-native** — all output is JSON by default, errors go to stderr, exit codes are 0/1

---

## Install & Auth

```bash
npm install -g prospeo-cli

# Set your API key (get it at https://prospeo.io/dashboard/api)
export PROSPEO_API_KEY="your-api-key"

# Verify
prospeo account info
```

**Other auth options:**
```bash
prospeo person enrich --api-key "your-key" --linkedin-url "..."   # per-command flag
prospeo login                                                       # interactive, stores in ~/.prospeo/config.json
```

---

## Commands

### person

```bash
# Enrich a single person
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --pretty
prospeo person enrich --email "john@acme.com"
prospeo person enrich --first-name "Eva" --last-name "Kiegler" --company-website "intercom.com"
prospeo person enrich --linkedin-url "..." --enrich-mobile --only-verified-mobile

# Bulk enrich up to 50 persons
prospeo person bulk-enrich \
  --data '[{"identifier":"1","linkedin_url":"https://linkedin.com/in/jdoe"},{"identifier":"2","email":"jane@stripe.com"}]' \
  --only-verified-email

# Search 200M+ contacts
prospeo person search \
  --filters '{"person_seniority":{"include":["Vice President","C-Suite"]},"company_industry":{"include":["Software Development"]}}' \
  --page 1 --pretty
```

### company

```bash
# Enrich a single company
prospeo company enrich --website "stripe.com" --pretty
prospeo company enrich --linkedin-url "https://linkedin.com/company/stripe"
prospeo company enrich --name "Salesforce" --website "salesforce.com"

# Bulk enrich up to 50 companies
prospeo company bulk-enrich \
  --data '[{"identifier":"1","company_website":"intercom.com"},{"identifier":"2","company_website":"stripe.com"}]'

# Search 30M+ companies
prospeo company search \
  --filters '{"company_funding":{"stage":["Series A","Series B"]},"company_location":["United States"]}' \
  --pretty
```

### suggestions (free — no credits)

```bash
# Get exact location strings for search filters
prospeo suggestions location --query "new york"
prospeo suggestions location --query "united states"

# Get exact job title strings for search filters
prospeo suggestions job-title --query "head of sales"
prospeo suggestions job-title --query "vp engineering"
```

### account

```bash
prospeo account info --pretty
# → {"current_plan":"GROWTH","remaining_credits":4850,"used_credits":150,"next_quota_renewal_date":"..."}
```

---

## Output flags (all commands)

```bash
--pretty          Pretty-printed JSON
--fields a,b,c    Return only specified top-level fields
--quiet           No output, exit code only
--api-key <key>   Override PROSPEO_API_KEY for this command
```

---

## MCP Server

Add to Claude Desktop, Cursor, or VS Code:

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

Or if installed globally: use `"command": "prospeo"` instead of `npx`.

MCP tools: `person_enrich`, `person_bulk_enrich`, `person_search`, `company_enrich`, `company_bulk_enrich`, `company_search`, `suggestions_location`, `suggestions_job_title`, `account_info`

---

## Search Filter Enums

### Seniority values
`"Founder/Owner"` `"C-Suite"` `"Partner"` `"Vice President"` `"Head"` `"Director"` `"Manager"` `"Senior"` `"Entry"` `"Intern"`

### Department values
`"C-Suite"` `"Sales"` `"Engineering & Technical"` `"Marketing"` `"Finance"` `"Human Resources"` `"Information Technology"` `"Legal"` `"Operations"` `"Product"` `"Design"` `"Consulting"` `"Medical & Health"` `"Education & Coaching"`

### Employee range values
`"1-10"` `"11-20"` `"21-50"` `"51-100"` `"101-200"` `"201-500"` `"501-1000"` `"1001-2000"` `"2001-5000"` `"5001-10000"` `"10000+"`

### Funding stage values
`"Pre seed"` `"Seed"` `"Series A"` `"Series B"` `"Series C"` `"Series D"` `"Series E-J"` `"Angel"` `"Grant"` `"Private equity"` `"Debt financing"` `"Convertible note"` `"Corporate round"` `"Post IPO equity"` `"Post IPO debt"`

### Location values
Use `prospeo suggestions location --query "<term>"` to get exact strings. Examples:
`"United States"` `"California"` `"New York City, New York, United States"` `"Greater San Francisco Bay Area"` `"Greater London Area"`

---

## Credit Costs

| Operation | Credits |
|-----------|---------|
| Person enrich | 1 |
| Person enrich + mobile | 10 |
| Person bulk-enrich (per match) | 1 or 10 |
| Person search (per page) | 1 |
| Company enrich | 1 |
| Company bulk-enrich (per match) | 1 |
| Company search (per page) | 1 |
| Suggestions, account info | Free |
| Re-enriching same record | Free |

---

## AI Agent Guide

See [AGENTS.md](./AGENTS.md) for complete workflows, all filter schemas, response shapes, error codes, and agent tips.

## License

MIT
