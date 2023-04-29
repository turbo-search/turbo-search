import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type crawlerManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddCrawlerData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    crawlerManifesto: crawlerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddCrawlerData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddCrawlerData["outputSchema"]>;
    }>
}

export type Crawler = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    crawlerManifesto: crawlerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        inputData: Z.infer<AddCrawlerData["inputSchema"]>,
        dataManagementKit: DataManagementKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<AddCrawlerData["outputSchema"]>;
    }>
}

export type CrawlerManager = {

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

}