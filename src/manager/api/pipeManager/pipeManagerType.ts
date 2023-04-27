import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type pipeManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type addPipeData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    pipeManifesto: pipeManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addPipeData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addPipeData["outputSchema"]>;
    }>
}

export type Pipe = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    pipeManifesto: pipeManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addPipeData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addPipeData["outputSchema"]>;
    }>
}

export type PipeManager = {

    init: () => Promise<void>;

    processAll: (inputData: any) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    checkSchema: () => Promise<void>;

    process: (
        inputData: any,
        pipe: Pipe
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

}