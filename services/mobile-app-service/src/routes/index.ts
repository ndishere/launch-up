import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processAndroidBuild } from '../lib/engine.ts';
import {
  PlayPolicyMissingError,
  SigningKeyInvalidError,
  GradleFastlaneError,
} from '../types/index.ts';

const fileDeltaSchema = z.object({
  file_path: z.string().min(1),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  content: z.string().optional(),
});

const androidBuildRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  golden_template_id: z.string().min(1, 'golden_template_id is required'),
  openapi_3_1_yaml: z.string().optional(),
  brand_assets: z.record(z.any()).optional(),
  package_name: z.string().min(1, 'package_name is required'),
  target_sdk_version: z.number().int().positive(),
  file_deltas: z.array(fileDeltaSchema),
  keystore_config: z.object({
    keystore_base64: z.string().optional(),
    key_alias: z.string().optional(),
    key_password: z.string().optional(),
    store_password: z.string().optional(),
  }).optional(),
  declared_permissions: z.array(z.string()).optional(),
  data_safety_csv_declarations: z.array(z.string()).optional(),
});

export async function mobileAppRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'mobile-app-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/mobile/build', async (request, reply) => {
    const parseResult = androidBuildRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processAndroidBuild(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof PlayPolicyMissingError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          missingDeclarations: err.missingDeclarations,
        });
      }
      if (err instanceof SigningKeyInvalidError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof GradleFastlaneError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        code: 'ERR_GRADLE_FASTLANE',
        error: 'Internal Gradle/Fastlane build execution error',
      });
    }
  });
}
