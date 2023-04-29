import z from "zod";

export const addInterceptorDataSchema =
    z.array(
        z.object({
            inputSchema: z.any(),
            outputSchema: z.any(),
            interceptorManifesto: z.object({
                name: z.string(),
                version: z.string(),
                coreDependence: z.string().optional(),
            }),
            init: z.function().optional(),
            process: z.function(),
        })
    );