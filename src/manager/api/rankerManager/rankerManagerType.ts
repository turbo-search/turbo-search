import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type RankerManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
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

export type AddRankerData = Ranker;