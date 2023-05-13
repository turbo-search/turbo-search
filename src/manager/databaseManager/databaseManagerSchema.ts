import z from "zod";

export const databaseSchema = z.object({
  databaseManifesto: z.object({
    name: z.string(),
    version: z.string(),
    coreDependence: z.string().optional(),
  }),
  init: z.function().optional(),
  addData: z.function(),
  addDataArray: z.function().optional(),
  deleteData: z.function().optional(),
  updateData: z.function().optional(),
  getAllData: z.function().optional(),
  fullTextSearch: z.function().optional(),
  vectorSearch: z.function().optional(),
});
