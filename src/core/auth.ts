import { loadConfig } from './config.js';
import { AuthError } from './errors.js';

export async function resolveApiKey(flagKey?: string): Promise<string> {
  // 1. --api-key flag takes highest priority
  if (flagKey) return flagKey;

  // 2. PROSPEO_API_KEY environment variable
  const envKey = process.env.PROSPEO_API_KEY;
  if (envKey) return envKey;

  // 3. Stored config from ~/.prospeo/config.json
  const config = await loadConfig();
  if (config?.api_key) return config.api_key;

  throw new AuthError(
    'No API key found. Set PROSPEO_API_KEY, use --api-key, or run: prospeo login',
  );
}
