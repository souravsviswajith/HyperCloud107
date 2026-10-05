import type { SecurityEvent, SecurityDecisionResult } from './security-policy';

export interface SaaSProviderReporter {
  report(event: SecurityEvent, decision: SecurityDecisionResult): Promise<void>;
}

export class HttpSaaSProviderReporter implements SaaSProviderReporter {
  constructor(private readonly endpoint: string, private readonly token?: string) {}

  async report(event: SecurityEvent, decision: SecurityDecisionResult): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify({ event, decision }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`SaaS security report failed: HTTP ${response.status}`);
    }
  }
}
