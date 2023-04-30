import z from "zod";

export const addInterceptorDataSchema = z.object({
    requestSchema: z.any(),
    inputSchema: z.any(),
    outputSchema: z.any(),
    interceptorManifesto: z.object({
        name: z.string(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    init: z.function().optional(),
    process: z.function(),
});