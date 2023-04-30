import z from "zod";

export const addRankerDataSchema = z.object({
    requestSchema: z.any(),
    outputSchema: z.any(),
    rankerManifesto: z.object({
        name: z.string(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    init: z.function().optional(),
    process: z.function(),
});