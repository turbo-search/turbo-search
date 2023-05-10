import z from "zod";
import { addCrawlerDataSchema } from "../api/crawlerManager/crawlerManagerSchema";
import { addIndexerDataSchema } from "../api/indexerManager/indexerManagerSchema";
import { addPipeDataSchema } from "../api/pipeManager/pipeManagerSchema";
import { addMiddlewareDataSchema } from "../api/middlewareManager/middlewareManagerSchema";

export const addInserterDataSchema = z.object({
    inserterManifesto: z.object({
        name: z.string(),
        queryPath: z.string().optional(),
        version: z.string(),
        coreDependence: z.string().optional(),
        databaseDependence: z.array(z.object({
            name: z.string(),
            version: z.string(),
        })).optional(),
        extensionDependence: z.record(z.string()).optional(),
    }),
    middleware: z.array(addMiddlewareDataSchema),
    crawler: addCrawlerDataSchema,
    pipe: z.array(addPipeDataSchema),
    indexer: addIndexerDataSchema,
});