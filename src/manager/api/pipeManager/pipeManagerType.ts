import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type PipeManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddPipeData = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    pipeManifesto: PipeManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<Pipe["requestSchema"]>,
        inputData: Z.infer<AddPipeData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddPipeData["outputSchema"]>;
    }>
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

export type PipeManager = {

    init: () => Promise<void>;

    checkSchema: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    processAll: (requestData: any, inputData: any) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    process: (
        requestData: any,
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

    requestSchema: Z.Schema | undefined;
    inputSchema: Z.Schema | undefined;
    outputSchema: Z.Schema | undefined;

}