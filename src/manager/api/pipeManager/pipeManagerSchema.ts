import z from "zod";

export const addPipeDataSchema = z.object({
    inputSchema: z.any(),
    outputSchema: z.any(),
    pipeManifesto: z.object({
        name: z.string(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    init: z.function().optional(),
    process: z.function(),
});