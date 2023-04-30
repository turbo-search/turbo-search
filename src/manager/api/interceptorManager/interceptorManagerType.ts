import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type InterceptorManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddInterceptorData = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    interceptorManifesto: InterceptorManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddInterceptorData["requestSchema"]>,
        inputData: Z.infer<AddInterceptorData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddInterceptorData["outputSchema"]>;
    }>
}

export type Interceptor = {
    requestSchema: Z.Schema;
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    interceptorManifesto: InterceptorManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddInterceptorData["requestSchema"]>,
        inputData: Z.infer<Interceptor["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<Interceptor["outputSchema"]>;
    }>
}
