import { Router } from 'express';
import { EcosystemIntegrationRegistry } from '../../../core/ecosystem-integration';
import { successResponse } from '../../utils/response';

export function createEcosystemRouter(
  registry = new EcosystemIntegrationRegistry(),
): Router {
  const router = Router();

  router.get('/integrations', (_req, res) => {
    return res.json(successResponse({
      schemaVersion: 1,
      integrations: registry.list(),
    }));
  });

  router.get('/integrations/:integrationId', (req, res) => {
    const integration = registry.resolve(req.params.integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Integration not found' },
      });
    }

    return res.json(successResponse(integration));
  });

  return router;
}

export const ecosystemRouter = createEcosystemRouter();
