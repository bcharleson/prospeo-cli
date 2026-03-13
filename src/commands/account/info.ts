import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const accountInfoCommand: CommandDefinition = {
  name: 'account_info',
  group: 'account',
  subcommand: 'info',
  description:
    'Get account information: current plan, remaining credits, used credits, team members, and next quota renewal date. Free — no credits consumed.',
  examples: [
    'prospeo account info',
    'prospeo account info --pretty',
    'prospeo account info --fields remaining_credits,next_quota_renewal_date',
  ],
  inputSchema: z.object({}),
  cliMappings: {},
  handler: async (_input, client) => {
    return client.get('/account-information');
  },
};
