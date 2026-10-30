import { describe, expect, it } from 'vitest';
import {
  EcosystemIntegrationRegistry,
  ecosystemIntegrationSchema,
  projectAtlasIntegration,
} from './ecosystem-integration';

describe('ecosystem integration registry', () => {
  it('registers Project Atlas as a plan-only integration', () => {
    const registry = new EcosystemIntegrationRegistry();
    const atlas = registry.resolve('107.project-atlas');

    expect(atlas?.repository).toBe(
      'https://github.com/souravsviswajith/Project-Atlas-Bootstrap',
    );
    expect(atlas?.integration.capabilities[0]).toMatchObject({
      id: 'workstation.plan.preview',
      mode: 'plan-only',
      executable: false,
    });
  });

  it('rejects malformed or executable descriptors that violate the contract', () => {
    const invalid = {
      ...projectAtlasIntegration,
      integration: {
        ...projectAtlasIntegration.integration,
        capabilities: [{
          ...projectAtlasIntegration.integration.capabilities[0],
          executable: 'yes',
        }],
      },
    };

    expect(() => ecosystemIntegrationSchema.parse(invalid)).toThrow();
  });

  it('replaces descriptors by stable integration id', () => {
    const registry = new EcosystemIntegrationRegistry();
    registry.register({ ...projectAtlasIntegration, version: '0.1.0' });

    expect(registry.list()).toHaveLength(1);
    expect(registry.resolve('107.project-atlas')?.version).toBe('0.1.0');
  });
});
