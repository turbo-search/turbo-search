import z from "zod";

export const addCrawlerDataSchema = z.object({
    requestSchema: z.any(),
    outputSchema: z.any(),
    crawlerManifesto: z.object({
        name: z.string(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    init: z.function().optional(),
    process: z.function(),
});