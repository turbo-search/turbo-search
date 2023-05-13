import Z from "zod";
import { TurboSearchKit } from "../../..";

export type IndexerManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
}

export type Indexer = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    indexerManifesto: IndexerManifesto;
    init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddIndexerData["requestSchema"]>,
        inputData: Z.infer<Indexer["inputSchema"]>,
        turboSearchKit: TurboSearchKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<Indexer["outputSchema"]>;
    }>
}

export type AddIndexerData = Indexer;