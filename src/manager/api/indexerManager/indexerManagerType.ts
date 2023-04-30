import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type IndexerManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

export type Indexer = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    indexerManifesto: IndexerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddIndexerData["requestSchema"]>,
        inputData: Z.infer<Indexer["inputSchema"]>,
        dataManagementKit: DataManagementKit
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