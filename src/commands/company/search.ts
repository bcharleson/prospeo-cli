import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const companySearchCommand: CommandDefinition = {
  name: 'company_search',
  group: 'company',
  subcommand: 'search',
  description:
    'Search 30M+ companies with filters for industry, location, funding, employee count, technologies, and more. Pass filters as a JSON object via --filters. 1 credit per page returned (25 results/page).',
  examples: [
    `prospeo company search --filters '{"company_industry":{"include":["Software Development"]},"company_headcount_range":["51-100","101-200"]}' --pretty`,
    `prospeo company search --filters '{"company_location_search":{"include":["United States"]},"company_funding":{"stage":["Series A","Series B"]}}' --page 1`,
    `prospeo company search --filters '{"company":{"websites":{"include":["stripe.com","brex.com","ramp.com"]}}}' --pretty`,
    `prospeo company search --filters '{"company_industry":{"include":["Financial Services"]},"company_location_search":{"include":["New York, United States"]}}' --page 2`,
  ],
  inputSchema: z.object({
    filters: z
      .preprocess(
        (v) => (typeof v === 'string' ? JSON.parse(v) : v),
        z.record(z.unknown()),
      )
      .describe(
        'JSON filter object. Verified working keys: company_industry {include/exclude}, company_location_search {include/exclude} (use suggestions location for exact strings), company_headcount_range (plain array e.g. ["51-100","101-200"]), company_headcount_custom {min,max}, company_funding {stage:[],last_funding:{min,max},total_funding:{min,max}}, company {websites:{include:[]}, names:{include:[]}}. Cannot use only exclude filters.',
      ),
    page: z.coerce
      .number()
      .min(1)
      .max(1000)
      .default(1)
      .describe('Page number (1–1000, 25 results per page)'),
  }),
  cliMappings: {
    options: [
      {
        field: 'filters',
        flags: '--filters <json>',
        description: 'JSON filter object',
      },
      { field: 'page', flags: '--page <number>', description: 'Page number (default: 1)' },
    ],
  },
  handler: async (input, client) => {
    return client.post('/search-company', {
      filters: input.filters,
      page: input.page,
    });
  },
};
