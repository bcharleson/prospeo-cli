import { Command } from 'commander';
import type { CommandDefinition, GlobalOptions } from '../core/types.js';
import { resolveApiKey } from '../core/auth.js';
import { ProspeoClient } from '../core/client.js';
import { output, outputError } from '../core/output.js';

// Auth commands
import { registerLoginCommand } from './auth/login.js';
import { registerLogoutCommand } from './auth/logout.js';

// MCP command
import { registerMcpCommand } from './mcp/index.js';

// Person
import { personEnrichCommand } from './person/enrich.js';
import { personBulkEnrichCommand } from './person/bulk-enrich.js';
import { personSearchCommand } from './person/search.js';

// Company
import { companyEnrichCommand } from './company/enrich.js';
import { companyBulkEnrichCommand } from './company/bulk-enrich.js';
import { companySearchCommand } from './company/search.js';

// Suggestions
import { suggestionsLocationCommand } from './suggestions/location.js';
import { suggestionsJobTitleCommand } from './suggestions/job-title.js';

// Account
import { accountInfoCommand } from './account/info.js';

/** All command definitions — single source of truth for both CLI and MCP */
export const allCommands: CommandDefinition[] = [
  // Person (3)
  personEnrichCommand,
  personBulkEnrichCommand,
  personSearchCommand,

  // Company (3)
  companyEnrichCommand,
  companyBulkEnrichCommand,
  companySearchCommand,

  // Suggestions (2)
  suggestionsLocationCommand,
  suggestionsJobTitleCommand,

  // Account (1)
  accountInfoCommand,
];

export function registerAllCommands(program: Command): void {
  // Auth commands (no API client needed)
  registerLoginCommand(program);
  registerLogoutCommand(program);

  // MCP server command
  registerMcpCommand(program);

  // Group commands by their `group` field
  const groups = new Map<string, CommandDefinition[]>();
  for (const cmd of allCommands) {
    if (!groups.has(cmd.group)) groups.set(cmd.group, []);
    groups.get(cmd.group)!.push(cmd);
  }

  for (const [groupName, commands] of groups) {
    const groupCmd = program
      .command(groupName)
      .description(`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} commands`);

    for (const cmdDef of commands) {
      registerCommand(groupCmd, cmdDef);
    }

    // Helpful error for unknown subcommands
    groupCmd.on('command:*', (operands: string[]) => {
      const available = commands.map((c) => c.subcommand).join(', ');
      console.error(`error: unknown command '${operands[0]}' for '${groupName}'`);
      console.error(`Available commands: ${available}`);
      process.exitCode = 1;
    });
  }
}

function registerCommand(parent: Command, cmdDef: CommandDefinition): void {
  const cmd = parent.command(cmdDef.subcommand).description(cmdDef.description);

  if (cmdDef.cliMappings.args) {
    for (const arg of cmdDef.cliMappings.args) {
      const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      cmd.argument(argStr, arg.field);
    }
  }

  if (cmdDef.cliMappings.options) {
    for (const opt of cmdDef.cliMappings.options) {
      cmd.option(opt.flags, opt.description ?? '');
    }
  }

  if (cmdDef.examples?.length) {
    cmd.addHelpText('after', '\nExamples:\n' + cmdDef.examples.map((e) => `  $ ${e}`).join('\n'));
  }

  cmd.action(async (...actionArgs: any[]) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions & Record<string, any>;

      if (globalOpts.pretty) {
        globalOpts.output = 'pretty';
      }

      const apiKey = await resolveApiKey(globalOpts.apiKey);
      const client = new ProspeoClient({ apiKey });

      const input: Record<string, any> = {};

      // Map positional arguments
      if (cmdDef.cliMappings.args) {
        for (let i = 0; i < cmdDef.cliMappings.args.length; i++) {
          const argDef = cmdDef.cliMappings.args[i];
          if (actionArgs[i] !== undefined) {
            input[argDef.field] = actionArgs[i];
          }
        }
      }

      // Map options
      if (cmdDef.cliMappings.options) {
        for (const opt of cmdDef.cliMappings.options) {
          const match = opt.flags.match(/--([a-z][a-z0-9-]*)/);
          if (match) {
            const optName = match[1].replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
            if (globalOpts[optName] !== undefined) {
              input[opt.field] = globalOpts[optName];
            }
          }
        }
      }

      // Validate
      const parsed = cmdDef.inputSchema.safeParse(input);
      if (!parsed.success) {
        const issues = parsed.error.issues ?? [];
        const missing = issues
          .filter(
            (i: any) =>
              i.code === 'invalid_type' && String(i.message).includes('received undefined'),
          )
          .map((i: any) => '--' + String(i.path?.[0] ?? '').replace(/_/g, '-'));
        if (missing.length > 0) {
          throw new Error(`Missing required option(s): ${missing.join(', ')}`);
        }
        const msg = issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Invalid input: ${msg}`);
      }

      const result = await cmdDef.handler(parsed.data, client);
      output(result, globalOpts);
    } catch (error) {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      outputError(error, globalOpts);
    }
  });
}
