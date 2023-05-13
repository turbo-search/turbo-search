import z from "zod";
import { crawlerSchema } from "../api/crawlerManager/crawlerManagerSchema";
import { indexerSchema } from "../api/indexerManager/indexerManagerSchema";
import { pipeSchema } from "../api/pipeManager/pipeManagerSchema";
import { middlewareSchema } from "../api/middlewareManager/middlewareManagerSchema";

export const inserterSchema = z.object({
  inserterManifesto: z.object({
    name: z.string(),
    queryPath: z.string().optional(),
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
  crawler: crawlerSchema,
  pipe: pipeSchema,
  indexer: indexerSchema,
});
