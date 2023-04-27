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

}