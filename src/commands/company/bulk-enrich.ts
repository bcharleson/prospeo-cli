import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

const CompanyRecord = z.object({
  identifier: z.string().describe('Unique alpha-numeric string to track this record in the response'),
  company_website: z.string().optional(),
  company_linkedin_url: z.string().url().optional(),
  company_name: z.string().optional(),
  company_id: z.string().optional(),
});

export const companyBulkEnrichCommand: CommandDefinition = {
  name: 'company_bulk_enrich',
  group: 'company',
  subcommand: 'bulk-enrich',
  description:
    'Enrich up to 50 companies in a single request. Pass a JSON array of company objects via --data. Each object requires an "identifier" field. Returns matched[], not_matched[], and invalid_datapoints[] arrays.',
  examples: [
    `prospeo company bulk-enrich --data '[{"identifier":"1","company_website":"intercom.com"},{"identifier":"2","company_website":"stripe.com"}]'`,
    `prospeo company bulk-enrich --data '[{"identifier":"a1","company_linkedin_url":"https://linkedin.com/company/salesforce"},{"identifier":"a2","company_website":"hubspot.com"}]' --pretty`,
  ],
  inputSchema: z.object({
    data: z
      .preprocess(
        (v) => (typeof v === 'string' ? JSON.parse(v) : v),
        z.array(CompanyRecord).min(1).max(50),
      )
      .describe('JSON array of up to 50 company objects, each with a unique "identifier" field'),
  }),
  cliMappings: {
    options: [
      {
        field: 'data',
        flags: '--data <json>',
        description: 'JSON array of company objects (each needs "identifier")',
      },
    ],
  },
  handler: async (input, client) => {
    return client.post('/bulk-enrich-company', { data: input.data });
  },
};
