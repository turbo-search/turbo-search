import z from "zod";
import { addRankerDataSchema } from "../api/rankerManager/rankerManagerSchema";
import { addInterceptorDataSchema } from "../api/interceptorManager/interceptorManagerSchema";
import { addPipeDataSchema } from "../api/pipeManager/pipeManagerSchema";
import { addMiddlewareDataSchema } from "../api/middlewareManager/middlewareManagerSchema";

export const addSearcherDataSchema = z.object({
    searcherManifesto: z.object({
        name: z.string(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    middleware: z.array(addMiddlewareDataSchema),
    ranker: addRankerDataSchema,
    pipe: z.array(addPipeDataSchema),
    interceptor: addInterceptorDataSchema,
    inputSchema: z.any(),
    outputSchema: z.any(),
});