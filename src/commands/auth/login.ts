import { Command } from 'commander';
import { ProspeoClient } from '../../core/client.js';
import { saveConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with your Prospeo API key')
    .option('--api-key <key>', 'API key (skips interactive prompt)')
    .action(async (opts) => {
      const globalOpts = program.opts() as GlobalOptions;

      try {
        let apiKey = opts.apiKey || process.env.PROSPEO_API_KEY;

        if (!apiKey) {
          if (!process.stdin.isTTY) {
            outputError(
              new Error('No API key provided. Use --api-key or set PROSPEO_API_KEY'),
              globalOpts,
            );
            return;
          }

          console.log('Get your API key from: https://prospeo.io/dashboard/api\n');

          const [major] = process.versions.node.split('.').map(Number);
          if (major < 20) {
            outputError(
              new Error(
                'Interactive login requires Node.js 20+. Use --api-key or set PROSPEO_API_KEY instead.',
              ),
              globalOpts,
            );
            return;
          }
          const { password } = await import('@inquirer/prompts');
          apiKey = await password({
            message: 'Enter your Prospeo API key:',
            mask: '*',
          });
        }

        if (!apiKey) {
          outputError(new Error('No API key provided'), globalOpts);
          return;
        }

        const client = new ProspeoClient({ apiKey });

        if (process.stdin.isTTY) {
          console.log('Validating API key...');
        }

        // Validate by fetching account information
        let accountInfo: any;
        try {
          accountInfo = await client.get('/account-information');
        } catch {
          accountInfo = null;
        }

        await saveConfig({ api_key: apiKey });

        const result = {
          status: 'authenticated',
          plan: accountInfo?.current_plan ?? 'unknown',
          remaining_credits: accountInfo?.remaining_credits ?? 'unknown',
          config_path: '~/.prospeo/config.json',
        };

        if (process.stdin.isTTY) {
          console.log('\nAuthenticated successfully!');
          if (accountInfo?.current_plan) console.log(`Plan: ${accountInfo.current_plan}`);
          if (accountInfo?.remaining_credits !== undefined)
            console.log(`Remaining credits: ${accountInfo.remaining_credits}`);
          console.log('Config saved to ~/.prospeo/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
