import { describe, expect, it } from 'vitest';
import { Career107LocalAdapter } from './career107-local-adapter';

describe('Career107LocalAdapter', () => {
  it.each([
    'https://127.0.0.1:8080',
    'http://example.com',
    'http://127.0.0.1.evil.test',
    'http://user:pass@127.0.0.1:8080',
    'http://127.0.0.1:8080/proxy',
    'http://127.0.0.1:8080/?target=example.com',
  ])('rejects unsafe base URL %s', (baseUrl) => {
    expect(() => new Career107LocalAdapter(baseUrl)).toThrow();
  });

  it.each([
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://[::1]:8080',
  ])('accepts loopback base URL %s', (baseUrl) => {
    expect(() => new Career107LocalAdapter(baseUrl)).not.toThrow();
  });
});
