import { TurboSearchKit } from "../../..";

export type middlewareManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
}

export type Middleware = {
    middlewareManifesto: middlewareManifesto;
    init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
    process: (
        inputData: any,
        turboSearchKit: TurboSearchKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>
}

export type AddMiddlewareData = Middleware;