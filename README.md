# prospeo-cli

> CLI and MCP server for the [Prospeo API](https://prospeo.io) — person/company enrichment and search for AI agents and developers.

## Install

```bash
npm install -g prospeo-cli
```

## Quick Start

```bash
export PROSPEO_API_KEY="your-api-key"

# Enrich a person
prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --pretty

# Enrich a company
prospeo company enrich --website "stripe.com" --pretty

# Search for leads
prospeo person search \
  --filters '{"person_seniority":{"include":["VP"]},"company_industry":{"include":["TECHNOLOGY"]}}' \
  --pretty

# Check your credits
prospeo account info
```

## Commands

| Group | Subcommand | Description |
|-------|-----------|-------------|
| `person` | `enrich` | Enrich a single person (email, mobile, job history) |
| `person` | `bulk-enrich` | Enrich up to 50 persons in one request |
| `person` | `search` | Search 200M+ contacts with 30+ filters |
| `company` | `enrich` | Enrich a single company (50+ data points) |
| `company` | `bulk-enrich` | Enrich up to 50 companies in one request |
| `company` | `search` | Search 30M+ companies with filters |
| `suggestions` | `location` | Autocomplete location strings (free) |
| `suggestions` | `job-title` | Autocomplete job title strings (free) |
| `account` | `info` | View plan, credits, and quota renewal |

## Authentication

```bash
# Option 1: env var (recommended)
export PROSPEO_API_KEY="your-api-key"

# Option 2: per-command
prospeo person enrich --api-key "your-api-key" --linkedin-url "..."

# Option 3: stored config
prospeo login
```

## MCP Server (for Claude, Cursor, VS Code)

```bash
prospeo mcp
```

Add to your MCP config:

```json
{
  "mcpServers": {
    "prospeo": {
      "command": "npx",
      "args": ["prospeo-cli", "mcp"],
      "env": { "PROSPEO_API_KEY": "your-api-key" }
    }
  }
}
```

## AI Agent Guide

See [AGENTS.md](./AGENTS.md) for a complete guide including all filter options, response schemas, credit costs, and common workflows.

## License

MIT
