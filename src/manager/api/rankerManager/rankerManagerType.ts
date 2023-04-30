import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type RankerManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddRankerData = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankerManifesto: RankerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddRankerData["requestSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddRankerData["outputSchema"]>;
    }>
}

export type Ranker = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankerManifesto: RankerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<Ranker["requestSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddRankerData["outputSchema"]>;
    }>
}

export type RankerManager = {

    init: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    process: (
        requestData: any,
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    requestSchema: Z.Schema;
    outputSchema: Z.Schema;

}