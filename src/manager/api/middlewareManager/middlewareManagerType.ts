import { DataManagementKit } from "../../../indexType";

export type middlewareManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddMiddlewareData = {
    middlewareManifesto: middlewareManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: any,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>
}

export type Middleware = {
    middlewareManifesto: middlewareManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: any,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>
}