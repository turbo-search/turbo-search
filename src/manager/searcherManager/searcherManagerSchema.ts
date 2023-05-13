import z from "zod";
import { middlewareSchema } from "../api/middlewareManager/middlewareManagerSchema";
import { rankerSchema } from "../api/rankerManager/rankerManagerSchema";
import { pipeSchema } from "../api/pipeManager/pipeManagerSchema";
import { interceptorSchema } from "../api/interceptorManager/interceptorManagerSchema";

export const searcherSchema = z.object({
  searcherManifesto: z.object({
    name: z.string(),
    version: z.string(),
    coreDependence: z.string().optional(),
    databaseDependence: z
      .array(
        z.object({
          name: z.string(),
          version: z.string(),
        })
      )
      .optional(),
    extensionDependence: z.record(z.string()).optional(),
  }),
  middleware: middlewareSchema,
  ranker: rankerSchema,
  pipe: pipeSchema,
  interceptor: interceptorSchema,
});
