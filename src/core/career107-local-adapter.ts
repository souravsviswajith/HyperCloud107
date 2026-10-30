import { z } from 'zod';

const healthSchema = z.object({
  status: z.literal('ok'),
  runtime: z.string().min(1),
}).passthrough();

const catalogSchema = z.record(z.string(), z.unknown());

export class Career107AdapterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'Career107AdapterError';
  }
}

/**
 * Read-only bridge to a Career107 runtime on the same machine.
 * Only /api/health and /api/catalog are exposed. Session and answer data
 * are never proxied and no mutation request is sent.
 */
export class Career107LocalAdapter {
  private readonly baseUrl: URL;

  constructor(baseUrl: string) {
    let parsed: URL;
    try {
      parsed = new URL(baseUrl);
    } catch (error) {
      throw new Career107AdapterError('Career107 base URL must be a valid URL', { cause: error });
    }

    const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
    if (
      parsed.protocol !== 'http:' ||
      !loopbackHosts.has(parsed.hostname) ||
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.search !== '' ||
      parsed.hash !== '' ||
      (parsed.pathname !== '' && parsed.pathname !== '/')
    ) {
      throw new Career107AdapterError('Career107 adapter only permits an HTTP loopback base URL');
    }

    this.baseUrl = parsed;
  }

  async health(): Promise<z.infer<typeof healthSchema>> {
    return healthSchema.parse(await this.get('/api/health'));
  }

  async catalog(): Promise<Record<string, unknown>> {
    return catalogSchema.parse(await this.get('/api/catalog'));
  }

  private async get(path: '/api/health' | '/api/catalog'): Promise<unknown> {
    const url = new URL(path, this.baseUrl);
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(3000),
      });
    } catch (error) {
      throw new Career107AdapterError('Career107 local runtime is unavailable', { cause: error });
    }

    if (!response.ok) {
      throw new Career107AdapterError(`Career107 returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Career107AdapterError('Career107 returned a non-JSON response');
    }

    const body = await response.arrayBuffer();
    if (body.byteLength > 256 * 1024) {
      throw new Career107AdapterError('Career107 metadata response exceeded 256 KiB');
    }

    try {
      return JSON.parse(new TextDecoder().decode(body)) as unknown;
    } catch (error) {
      throw new Career107AdapterError('Career107 returned invalid JSON', { cause: error });
    }
  }
}
