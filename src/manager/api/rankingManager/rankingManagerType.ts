import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type rankingManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddRankingData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankingManifesto: rankingManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddRankingData["inputSchema"]>,
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
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    rankingManifesto: rankingManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddRankingData["inputSchema"]>,
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
        inputData: any,
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: any;
    }>;

    inputSchema: Z.Schema;
    outputSchema: Z.Schema;

}