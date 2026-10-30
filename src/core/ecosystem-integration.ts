import { z } from 'zod';

const integrationCapabilitySchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9.-]+$/),
  contractVersion: z.number().int().positive(),
  mode: z.enum(['plan-only', 'invoke']),
  description: z.string().min(1),
  input: z.string().min(1),
  output: z.string().min(1),
  executable: z.boolean(),
}).strict();

export const ecosystemIntegrationSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z][a-z0-9.-]+$/),
  name: z.string().min(1),
  repository: z.string().url(),
  license: z.string().min(1),
  version: z.string().min(1),
  integration: z.object({
    contractVersion: z.number().int().positive(),
    capabilities: z.array(integrationCapabilitySchema).min(1),
  }).strict(),
}).strict();

export type EcosystemIntegration = z.infer<typeof ecosystemIntegrationSchema>;

/**
 * Project Atlas currently produces deterministic, non-mutating workstation
 * plans. It is intentionally registered as a plan-only integration; this
 * descriptor does not grant HyperCloud permission to install software.
 */
export const projectAtlasIntegration: EcosystemIntegration = ecosystemIntegrationSchema.parse({
  schemaVersion: 1,
  id: '107.project-atlas',
  name: 'Project Atlas Bootstrap',
  repository: 'https://github.com/souravsviswajith/Project-Atlas-Bootstrap',
  license: 'Apache-2.0',
  version: '0.0.0',
  integration: {
    contractVersion: 1,
    capabilities: [
      {
        id: 'workstation.plan.preview',
        contractVersion: 1,
        mode: 'plan-only',
        description: 'Validate Atlas workstation intent and produce a deterministic preview plan.',
        input: 'Project Atlas config schema v1',
        output: 'Project Atlas plan schema v1',
        executable: false,
      },
    ],
  },
});

export class EcosystemIntegrationRegistry {
  private readonly integrations = new Map<string, EcosystemIntegration>();

  constructor(initial: EcosystemIntegration[] = [projectAtlasIntegration]) {
    for (const integration of initial) this.register(integration);
  }

  register(candidate: unknown): EcosystemIntegration {
    const integration = ecosystemIntegrationSchema.parse(candidate);
    this.integrations.set(integration.id, integration);
    return integration;
  }

  list(): EcosystemIntegration[] {
    return [...this.integrations.values()];
  }

  resolve(id: string): EcosystemIntegration | null {
    return this.integrations.get(id) ?? null;
  }
}
