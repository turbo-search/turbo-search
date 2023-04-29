import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type indexerManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddIndexerData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    indexerManifesto: indexerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddIndexerData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddIndexerData["outputSchema"]>;
    }>
}

export type Indexer = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    indexerManifesto: indexerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddIndexerData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddIndexerData["outputSchema"]>;
    }>
}

export type IndexerManager = {

    init: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    process: (
        inputData: any,
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    inputSchema: Z.Schema;
    outputSchema: Z.Schema;

}