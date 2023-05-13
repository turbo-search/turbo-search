import z from "zod";

export const addExtensionSchema = z.object({
  manifesto: z.object({
    name: z.string(),
    dependence: z.record(z.string()).default({}),
    coreDependence: z.string().default(""),
    version: z.string(),
  }),
  init: z.function().optional(),
  available: z.function().optional(),
});
