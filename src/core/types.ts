import { z } from 'zod';

export interface CliMapping {
  args?: Array<{
    field: string;
    name: string;
    required?: boolean;
  }>;
  options?: Array<{
    field: string;
    flags: string;
    description?: string;
  }>;
}

export interface CommandDefinition<TInput extends z.ZodObject<any> = z.ZodObject<any>> {
  /** Unique identifier, used as MCP tool name. e.g., "person_enrich" */
  name: string;

  /** CLI group. e.g., "person" */
  group: string;

  /** CLI subcommand name. e.g., "enrich" */
  subcommand: string;

  /** Human-readable description (used in --help AND MCP tool description) */
  description: string;

  /** Detailed examples for --help output */
  examples?: string[];

  /** Zod schema defining all inputs */
  inputSchema: TInput;

  /** Maps Zod fields to CLI constructs (args and options) */
  cliMappings: CliMapping;

  /** The handler function */
  handler: (input: z.infer<TInput>, client: ProspeoClient) => Promise<unknown>;
}

export interface ProspeoClient {
  post<T>(path: string, body?: unknown): Promise<T>;
  get<T>(path: string): Promise<T>;
}

export interface ProspeoConfig {
  api_key: string;
}

export interface GlobalOptions {
  apiKey?: string;
  output?: 'json' | 'pretty';
  quiet?: boolean;
  fields?: string;
}
