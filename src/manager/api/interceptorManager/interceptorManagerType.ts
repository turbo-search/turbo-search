import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type interceptorManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type addInterceptorData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    interceptorManifesto: interceptorManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addInterceptorData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addInterceptorData["outputSchema"]>;
    }>
}

export type Interceptor = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    interceptorManifesto: interceptorManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<addInterceptorData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addInterceptorData["outputSchema"]>;
    }>
}

export type InterceptorManager = {

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
        interceptor: Interceptor
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