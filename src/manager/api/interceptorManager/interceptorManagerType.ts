import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type InterceptorManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
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

export type AddInterceptorData = Interceptor;