import type { ProspeoClient as IProspeoClient } from './types.js';
import {
  AuthError,
  ValidationError,
  RateLimitError,
  InsufficientCreditsError,
  NoMatchError,
  ServerError,
  ProspeoError,
} from './errors.js';

const BASE_URL = 'https://api.prospeo.io';
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30_000;
const VERSION = '0.1.0';

interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export class ProspeoClient implements IProspeoClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.maxRetries = options.maxRetries ?? MAX_RETRIES;
    this.timeout = options.timeout ?? REQUEST_TIMEOUT;
  }

  async request<T>(options: {
    method: 'GET' | 'POST';
    path: string;
    body?: unknown;
  }): Promise<T> {
    const url = `${this.baseUrl}${options.path}`;

    const headers: Record<string, string> = {
      'X-KEY': this.apiKey,
      'User-Agent': `prospeo-cli/${VERSION}`,
      Accept: 'application/json',
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { error: true, error_code: 'PARSE_ERROR', message: text };
        }

        if (response.ok) {
          // Prospeo returns { error: false, ... } on success
          if (parsed?.error === true) {
            // Treat as error even on 200 if error flag is set
            throw this.parseApiError(parsed, response.status);
          }
          return parsed as T;
        }

        throw this.parseApiError(parsed, response.status);
      } catch (error) {
        if (error instanceof ProspeoError) {
          // Rate limit and server errors are retryable
          if (
            (error instanceof RateLimitError || error instanceof ServerError) &&
            attempt < this.maxRetries
          ) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10_000);
            await sleep(delay);
            lastError = error;
            continue;
          }
          throw error;
        }

        const isAbort =
          error instanceof Error &&
          (error.name === 'AbortError' || String(error.message).includes('aborted'));

        if (isAbort) {
          lastError = new ProspeoError(
            `Request timed out after ${this.timeout / 1000}s: ${options.method} ${options.path}`,
            'TIMEOUT',
          );
          if (attempt < this.maxRetries) {
            await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
            continue;
          }
          throw lastError;
        }

        if (error instanceof TypeError && String(error.message).includes('fetch')) {
          throw new ProspeoError(`Network error: ${error.message}`, 'NETWORK_ERROR');
        }

        throw error;
      }
    }

    throw lastError ?? new ProspeoError('Request failed after retries', 'MAX_RETRIES');
  }

  private parseApiError(body: any, statusCode: number): ProspeoError {
    const code = body?.error_code ?? body?.code ?? 'API_ERROR';
    const message =
      body?.message ?? body?.error_message ?? body?.error ?? `API error (HTTP ${statusCode})`;

    switch (code) {
      case 'INVALID_API_KEY':
        return new AuthError(message);
      case 'INSUFFICIENT_CREDITS':
        return new InsufficientCreditsError(message);
      case 'NO_MATCH':
      case 'NO_RESULTS':
        return new NoMatchError(message);
      case 'RATE_LIMITED':
        return new RateLimitError(message);
      case 'INVALID_DATAPOINTS':
      case 'INVALID_FILTERS':
      case 'INVALID_REQUEST':
        return new ValidationError(message);
      case 'INTERNAL_ERROR':
        return new ServerError(message, statusCode);
      default:
        if (statusCode === 401) return new AuthError(message);
        if (statusCode === 429) return new RateLimitError(message);
        if (statusCode >= 500) return new ServerError(message, statusCode);
        return new ProspeoError(message, code, statusCode);
    }
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'GET', path });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
