import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type middlewareManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type addMiddlewareData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    middlewareManifesto: middlewareManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addMiddlewareData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addMiddlewareData["outputSchema"]>;
    }>
}

export type Middleware = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    middlewareManifesto: middlewareManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addMiddlewareData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addMiddlewareData["outputSchema"]>;
    }>
}

export type MiddlewareManager = {

    init: () => Promise<void>;

    checkSchema: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    processAll: (inputData: any) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    process: (
        inputData: any,
        middleware: Middleware
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    inputSchema: Z.Schema | undefined;
    outputSchema: Z.Schema | undefined;

}