import z from "zod";

export const rankerSchema = z.object({
  requestSchema: z.any(),
  outputSchema: z.any(),
  rankerManifesto: z.object({
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
  init: z.function().optional(),
  process: z.function(),
});
