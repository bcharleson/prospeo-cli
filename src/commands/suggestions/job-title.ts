import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const suggestionsJobTitleCommand: CommandDefinition = {
  name: 'suggestions_job_title',
  group: 'suggestions',
  subcommand: 'job-title',
  description:
    'Get autocomplete job title suggestions for use in person search filters. Returns up to 25 results ordered by popularity. Free — no credits consumed. Use the returned values in the person_job_title filter array.',
  examples: [
    'prospeo suggestions job-title --query "head of sales"',
    'prospeo suggestions job-title --query "vp engineering" --pretty',
    'prospeo suggestions job-title --query "chief revenue"',
    'prospeo suggestions job-title --query "software engineer"',
  ],
  inputSchema: z.object({
    query: z
      .string()
      .min(2)
      .describe('Job title search query (minimum 2 characters). E.g. "head of sales", "vp engineer"'),
  }),
  cliMappings: {
    options: [
      {
        field: 'query',
        flags: '--query <text>',
        description: 'Job title search query (min 2 chars)',
      },
    ],
  },
  handler: async (input, client) => {
    return client.post('/search-suggestions', {
      job_title_search: input.query,
    });
  },
};
