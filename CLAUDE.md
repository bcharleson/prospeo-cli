# CLAUDE.md — Developer Guide for prospeo-cli

## Architecture Overview

This project follows the **CommandDefinition** pattern used across all bcharleson CLI tools:

- **One `CommandDefinition` object** = one CLI subcommand + one MCP tool
- All commands live in `src/commands/` grouped by resource
- `src/commands/index.ts` is the single registry — add commands here
- The MCP server (`src/mcp/server.ts`) auto-registers all commands from `allCommands[]`
- CLI registration (`registerAllCommands()`) also loops over `allCommands[]`

## Adding a New Command

1. Create `src/commands/{group}/{subcommand}.ts`
2. Export a `CommandDefinition` object
3. Import and add it to `allCommands[]` in `src/commands/index.ts`

That's it — the command automatically appears in both the CLI and the MCP server.

### Command Template

```typescript
import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const resourceActionCommand: CommandDefinition = {
  name: 'resource_action',          // snake_case, unique MCP tool name
  group: 'resource',                // CLI group name (kebab-case)
  subcommand: 'action',             // CLI subcommand name
  description: 'What this does.',   // Used in --help and MCP

  inputSchema: z.object({
    id: z.string().describe('Resource ID'),
    name: z.string().optional().describe('Name'),
  }),

  cliMappings: {
    args: [{ field: 'id', name: 'id', required: true }],  // positional args
    options: [
      { field: 'name', flags: '--name <name>', description: 'Name' },
    ],
  },

  handler: async (input, client) => {
    return client.post('/endpoint', { data: input });
  },
};
```

## Prospeo API Specifics

- **Base URL:** `https://api.prospeo.io`
- **Auth:** `X-KEY: your_api_key` header (implemented in `ProspeoClient`)
- **HTTP methods:** All enrichment/search endpoints use POST; account info uses GET
- **Rate limits:** 429 → CLI retries with exponential backoff automatically
- **Error flag:** Prospeo can return `{ "error": true }` even on HTTP 200 — the client handles this
- **Nested body:** All POST bodies use nested `data` object or `filters` + `page`
- **Credits:** 1 per enrich or search page; 10 if `enrich_mobile: true`; free for suggestions + account

## Project Structure

```
src/
  index.ts             CLI entry point (Commander.js)
  mcp.ts               MCP server entry point
  core/
    types.ts            CommandDefinition, ProspeoClient, GlobalOptions interfaces
    client.ts           HTTP client (X-KEY header, retry, rate limiting)
    config.ts           ~/.prospeo/config.json management
    auth.ts             API key resolution (flag > env > config)
    errors.ts           Typed error classes
    output.ts           JSON output formatting
  mcp/
    server.ts           MCP server (loops allCommands[], registers as MCP tools)
  commands/
    index.ts            allCommands[] registry + registerAllCommands()
    auth/               login, logout (special — no API client)
    mcp/                mcp command registration
    person/             enrich, bulk-enrich, search
    company/            enrich, bulk-enrich, search
    suggestions/        location, job-title (free, no credits)
    account/            info
```

## Build & Dev

```bash
npm install
npm run dev -- person enrich --linkedin-url "https://linkedin.com/in/jdoe"
npm run dev:mcp                    # Run MCP server in dev mode
npm run build                      # Build to dist/
npm run typecheck                  # TypeScript type check
```

## Zod Version Note

This project uses Zod v3 (`"zod": "^3.24.0"`). The `inputSchema.shape` property is used in the MCP server to extract the Zod shape for tool registration. Do not upgrade to Zod v4 without testing the MCP server registration.

## Conventions

- Use `z.preprocess()` for JSON array/object fields passed as CLI strings (e.g. `--filters`, `--data`)
- Use `z.coerce.number()` for numeric CLI options (Commander.js passes everything as strings)
- Boolean CLI flags: use `z.preprocess()` with `v === true || v === 'true'` pattern
- All `handler` functions must return `Promise<unknown>`
- Keep command descriptions concise but complete — they appear in MCP tool descriptions seen by AI models
- All Prospeo POST endpoints expect `Content-Type: application/json` and `X-KEY` header
- The `data` wrapper object is required for enrich endpoints; `filters` + `page` for search endpoints
