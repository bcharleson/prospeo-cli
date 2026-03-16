import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const suggestionsLocationCommand: CommandDefinition = {
  name: 'suggestions_location',
  group: 'suggestions',
  subcommand: 'location',
  description:
    'Get autocomplete location suggestions for use in person/company search filters. Returns COUNTRY, STATE, CITY, and ZONE entries. Free — no credits consumed. Use the returned "name" values in company_location_search and person_location_search filter objects.',
  examples: [
    'prospeo suggestions location --query "united states"',
    'prospeo suggestions location --query "new york" --pretty',
    'prospeo suggestions location --query "san fra"',
    'prospeo suggestions location --query "greater toronto"',
  ],
  inputSchema: z.object({
    query: z
      .string()
      .min(2)
      .describe('Location search query (minimum 2 characters). E.g. "united states", "california", "new york"'),
  }),
  cliMappings: {
    options: [
      {
        field: 'query',
        flags: '--query <text>',
        description: 'Location search query (min 2 chars)',
      },
    ],
  },
  handler: async (input, client) => {
    return client.post('/search-suggestions', {
      location_search: input.query,
    });
  },
};
