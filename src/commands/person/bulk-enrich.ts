import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

const PersonRecord = z.object({
  identifier: z.string().describe('Unique alpha-numeric string to track this record in the response'),
  linkedin_url: z.string().url().optional(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  company_name: z.string().optional(),
  company_website: z.string().optional(),
  company_linkedin_url: z.string().url().optional(),
  person_id: z.string().optional(),
});

export const personBulkEnrichCommand: CommandDefinition = {
  name: 'person_bulk_enrich',
  group: 'person',
  subcommand: 'bulk-enrich',
  description:
    'Enrich up to 50 persons in a single request. Pass a JSON array of person objects via --data. Each object requires an "identifier" field for tracking. Returns matched[], not_matched[], and invalid_datapoints[] arrays.',
  examples: [
    `prospeo person bulk-enrich --data '[{"identifier":"1","linkedin_url":"https://linkedin.com/in/jdoe"},{"identifier":"2","email":"jane@acme.com"}]'`,
    `prospeo person bulk-enrich --data '[{"identifier":"1","first_name":"John","last_name":"Doe","company_website":"acme.com"}]' --only-verified-email`,
    `prospeo person bulk-enrich --data '[{"identifier":"1","linkedin_url":"https://linkedin.com/in/jdoe"}]' --enrich-mobile --pretty`,
  ],
  inputSchema: z.object({
    data: z
      .preprocess(
        (v) => (typeof v === 'string' ? JSON.parse(v) : v),
        z.array(PersonRecord).min(1).max(50),
      )
      .describe('JSON array of up to 50 person objects, each with a unique "identifier" field'),
    only_verified_email: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Only return records with a verified email'),
    enrich_mobile: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Also enrich mobile phone number'),
    only_verified_mobile: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Only return records with a verified mobile'),
  }),
  cliMappings: {
    options: [
      { field: 'data', flags: '--data <json>', description: 'JSON array of person objects (each needs "identifier")' },
      { field: 'only_verified_email', flags: '--only-verified-email', description: 'Only return records with verified email' },
      { field: 'enrich_mobile', flags: '--enrich-mobile', description: 'Enrich mobile numbers' },
      { field: 'only_verified_mobile', flags: '--only-verified-mobile', description: 'Only return records with verified mobile' },
    ],
  },
  handler: async (input, client) => {
    const { data, only_verified_email, enrich_mobile, only_verified_mobile } = input;

    const body: Record<string, unknown> = { data };
    if (only_verified_email !== undefined) body.only_verified_email = only_verified_email;
    if (enrich_mobile !== undefined) body.enrich_mobile = enrich_mobile;
    if (only_verified_mobile !== undefined) body.only_verified_mobile = only_verified_mobile;

    return client.post('/bulk-enrich-person', body);
  },
};
