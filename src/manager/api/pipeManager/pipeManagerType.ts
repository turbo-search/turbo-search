import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type PipeManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
}

export type Pipe = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    pipeManifesto: PipeManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<Pipe["requestSchema"]>,
        inputData: Z.infer<Pipe["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<Pipe["outputSchema"]>;
    }>
}

export type AddPipeData = Pipe;