import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type RankingManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddRankingData = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankingManifesto: RankingManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddRankingData["requestSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddRankingData["outputSchema"]>;
    }>
}

export type Ranking = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankingManifesto: RankingManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<Ranking["requestSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddRankingData["outputSchema"]>;
    }>
}

export type RankingManager = {

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