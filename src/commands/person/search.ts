import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const personSearchCommand: CommandDefinition = {
  name: 'person_search',
  group: 'person',
  subcommand: 'search',
  description:
    'Search 200M+ persons with 30+ filters. Pass filters as a JSON object via --filters. Use --page for pagination (25 results/page, max 1000 pages). 1 credit per page returned. Use "prospeo suggestions location" and "prospeo suggestions job-title" to find exact filter values.',
  examples: [
    `prospeo person search --filters '{"person_seniority":{"include":["C_SUITE","VP"]},"company_industry":{"include":["TECHNOLOGY"]}}' --pretty`,
    `prospeo person search --filters '{"company_websites":["stripe.com","brex.com"]}' --page 2`,
    `prospeo person search --filters '{"person_job_title":["Head of Sales"],"company_location":["United States"]}' --pretty`,
    `prospeo person search --filters '{"person_seniority":{"include":["DIRECTOR"]},"company_employee_range":{"include":["51_200","201_500"]}}' --fields "person,company"`,
  ],
  inputSchema: z.object({
    filters: z
      .preprocess(
        (v) => (typeof v === 'string' ? JSON.parse(v) : v),
        z.record(z.unknown()),
      )
      .describe(
        'JSON object of search filters. Common keys: person_seniority (include/exclude arrays), person_job_title (array), company_industry (include/exclude), company_location (array), person_location (array), company_websites (array, max 500), company_names (array, max 500), company_employee_range (include/exclude), person_year_of_experience (min/max), person_department (include/exclude). Use search-suggestions for exact location/job-title values.',
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
