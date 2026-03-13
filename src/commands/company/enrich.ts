import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const companyEnrichCommand: CommandDefinition = {
  name: 'company_enrich',
  group: 'company',
  subcommand: 'enrich',
  description:
    'Enrich a company with 50+ data points: funding, technologies, headcount, location, job postings, social URLs, and more. Provide company_website or company_linkedin_url for best accuracy.',
  examples: [
    'prospeo company enrich --website "intercom.com"',
    'prospeo company enrich --linkedin-url "https://linkedin.com/company/stripe"',
    'prospeo company enrich --website "deloitte.com" --pretty',
    'prospeo company enrich --company-id "cccc7c7da6116a8830a07100"',
    'prospeo company enrich --name "Salesforce" --website "salesforce.com"',
  ],
  inputSchema: z.object({
    company_website: z
      .string()
      .optional()
      .describe('Company website domain (e.g. intercom.com)'),
    company_linkedin_url: z
      .string()
      .url()
      .optional()
      .describe("Company LinkedIn URL (e.g. https://linkedin.com/company/stripe)"),
    company_name: z
      .string()
      .optional()
      .describe('Company name — avoid using alone, pair with website or LinkedIn URL'),
    company_id: z
      .string()
      .optional()
      .describe('Company ID from previous enrichment or search results'),
  }),
  cliMappings: {
    options: [
      { field: 'company_website', flags: '--website <domain>', description: 'Company domain (e.g. intercom.com)' },
      { field: 'company_linkedin_url', flags: '--linkedin-url <url>', description: 'Company LinkedIn URL' },
      { field: 'company_name', flags: '--name <name>', description: 'Company name (use with website or LinkedIn URL)' },
      { field: 'company_id', flags: '--company-id <id>', description: 'Company ID from previous results' },
    ],
  },
  handler: async (input, client) => {
    const data: Record<string, string> = {};
    if (input.company_website) data.company_website = input.company_website;
    if (input.company_linkedin_url) data.company_linkedin_url = input.company_linkedin_url;
    if (input.company_name) data.company_name = input.company_name;
    if (input.company_id) data.company_id = input.company_id;

    return client.post('/enrich-company', { data });
  },
};
