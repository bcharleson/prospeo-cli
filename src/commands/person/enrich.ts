import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const personEnrichCommand: CommandDefinition = {
  name: 'person_enrich',
  group: 'person',
  subcommand: 'enrich',
  description:
    'Enrich a person with verified contact details, email, mobile, job history, and company data. Provide at least one of: linkedin_url, email, person_id, or (first_name/last_name + company identifier).',
  examples: [
    'prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe"',
    'prospeo person enrich --email "john@acme.com"',
    'prospeo person enrich --first-name "Eva" --last-name "Kiegler" --company-website "intercom.com"',
    'prospeo person enrich --first-name "John" --last-name "Doe" --company-name "Acme" --enrich-mobile',
    'prospeo person enrich --linkedin-url "https://linkedin.com/in/jdoe" --only-verified-email --pretty',
  ],
  inputSchema: z.object({
    linkedin_url: z.string().url().optional().describe('LinkedIn profile URL'),
    email: z.string().email().optional().describe('Work email address'),
    first_name: z.string().optional().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    full_name: z.string().optional().describe('Full name'),
    company_name: z.string().optional().describe('Company name'),
    company_website: z.string().optional().describe('Company website domain (e.g. intercom.com)'),
    company_linkedin_url: z.string().url().optional().describe("Company's LinkedIn URL"),
    person_id: z.string().optional().describe('Person ID from search-person results'),
    only_verified_email: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Only return records with a verified email'),
    enrich_mobile: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Also enrich mobile phone number (costs 10 credits instead of 1)'),
    only_verified_mobile: z
      .preprocess((v) => v === true || v === 'true', z.boolean())
      .optional()
      .describe('Only return records with a verified mobile (requires enrich_mobile)'),
  }),
  cliMappings: {
    options: [
      { field: 'linkedin_url', flags: '--linkedin-url <url>', description: 'LinkedIn profile URL' },
      { field: 'email', flags: '--email <email>', description: 'Work email address' },
      { field: 'first_name', flags: '--first-name <name>', description: 'First name' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'full_name', flags: '--full-name <name>', description: 'Full name' },
      { field: 'company_name', flags: '--company-name <name>', description: 'Company name' },
      { field: 'company_website', flags: '--company-website <domain>', description: 'Company website (e.g. intercom.com)' },
      { field: 'company_linkedin_url', flags: '--company-linkedin-url <url>', description: 'Company LinkedIn URL' },
      { field: 'person_id', flags: '--person-id <id>', description: 'Person ID from search results' },
      { field: 'only_verified_email', flags: '--only-verified-email', description: 'Only return records with verified email' },
      { field: 'enrich_mobile', flags: '--enrich-mobile', description: 'Enrich mobile number (10 credits)' },
      { field: 'only_verified_mobile', flags: '--only-verified-mobile', description: 'Only return records with verified mobile' },
    ],
  },
  handler: async (input, client) => {
    const { only_verified_email, enrich_mobile, only_verified_mobile, ...dataFields } = input;

    // Build data object — only include provided fields
    const data: Record<string, string> = {};
    if (dataFields.linkedin_url) data.linkedin_url = dataFields.linkedin_url;
    if (dataFields.email) data.email = dataFields.email;
    if (dataFields.first_name) data.first_name = dataFields.first_name;
    if (dataFields.last_name) data.last_name = dataFields.last_name;
    if (dataFields.full_name) data.full_name = dataFields.full_name;
    if (dataFields.company_name) data.company_name = dataFields.company_name;
    if (dataFields.company_website) data.company_website = dataFields.company_website;
    if (dataFields.company_linkedin_url) data.company_linkedin_url = dataFields.company_linkedin_url;
    if (dataFields.person_id) data.person_id = dataFields.person_id;

    const body: Record<string, unknown> = { data };
    if (only_verified_email !== undefined) body.only_verified_email = only_verified_email;
    if (enrich_mobile !== undefined) body.enrich_mobile = enrich_mobile;
    if (only_verified_mobile !== undefined) body.only_verified_mobile = only_verified_mobile;

    return client.post('/enrich-person', body);
  },
};
