import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const personSearchCommand: CommandDefinition = {
  name: 'person_search',
  group: 'person',
  subcommand: 'search',
  description:
    'Search 200M+ persons with 30+ filters. Pass filters as a JSON object via --filters. Use --page for pagination (25 results/page, max 1000 pages). 1 credit per page returned. Use "prospeo suggestions location" and "prospeo suggestions job-title" to find exact filter values.',
  examples: [
    `prospeo person search --filters '{"person_seniority":{"include":["Vice President","C-Suite"]},"company_industry":{"include":["Software Development"]}}' --pretty`,
    `prospeo person search --filters '{"company":{"websites":{"include":["stripe.com","brex.com"]}}}' --page 2`,
    `prospeo person search --filters '{"person_seniority":{"include":["Director"]},"company_location_search":{"include":["United States"]}}' --pretty`,
    `prospeo person search --filters '{"person_job_title":{"include":["Head of Sales"]},"company_headcount_range":["101-200","201-500"]}' --fields "person,company"`,
  ],
  inputSchema: z.object({
    filters: z
      .preprocess(
        (v) => (typeof v === 'string' ? JSON.parse(v) : v),
        z.record(z.unknown()),
      )
      .describe(
        'JSON filter object. Verified working keys: person_seniority {include/exclude}, person_job_title {include, match_only_exact_job_titles?}, person_department {include/exclude}, person_location_search {include/exclude} (use suggestions location for exact strings), company_industry {include/exclude}, company_location_search {include/exclude} (use suggestions location for exact strings), company_headcount_range (plain array e.g. ["51-100","101-200"]), company_headcount_custom {min,max}, company {websites:{include:[]}, names:{include:[]}}. Cannot use only exclude filters.',
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
        description: 'JSON filter object (see docs for available filter keys)',
      },
      { field: 'page', flags: '--page <number>', description: 'Page number (default: 1)' },
    ],
  },
  handler: async (input, client) => {
    return client.post('/search-person', {
      filters: input.filters,
      page: input.page,
    });
  },
};
