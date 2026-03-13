import { Command } from 'commander';
import { deleteConfig } from '../../core/config.js';
import { output, outputError } from '../../core/output.js';
import type { GlobalOptions } from '../../core/types.js';

export function registerLogoutCommand(program: Command): void {
  program
    .command('logout')
    .description('Remove stored Prospeo API key from local config')
    .action(async () => {
      const globalOpts = program.opts() as GlobalOptions;
      try {
        await deleteConfig();
        const result = { status: 'logged_out', message: 'Config removed from ~/.prospeo/config.json' };
        if (process.stdin.isTTY) {
          console.log('Logged out. Config removed from ~/.prospeo/config.json');
        } else {
          output(result, globalOpts);
        }
      } catch (error) {
        outputError(error, globalOpts);
      }
    });
}
