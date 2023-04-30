import z from "zod";
import { addCrawlerDataSchema } from "../api/crawlerManager/crawlerManagerSchema";
import { addIndexerDataSchema } from "../api/indexerManager/indexerManagerSchema";
import { addPipeDataSchema } from "../api/pipeManager/pipeManagerSchema";
import { addMiddlewareDataSchema } from "../api/middlewareManager/middlewareManagerSchema";

export const addAdderDataSchema = z.object({
    adderManifesto: z.object({
        name: z.string(),
        queryPath: z.string().optional(),
        version: z.string(),
        coreDependence: z.string().optional(),
    }),
    middleware: z.array(addMiddlewareDataSchema),
    crawler: addCrawlerDataSchema,
    pipe: z.array(addPipeDataSchema),
    indexer: addIndexerDataSchema,
});