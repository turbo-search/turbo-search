import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type CrawlerManifesto = {
    name: string;
    coreDependence?: string;
    databaseDependence?: {
        name: string;
        version: string;
    }[];
    extensionDependence?: { [extensionName: string]: string };
    version: string;
}

export type Crawler = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    crawlerManifesto: CrawlerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<Crawler["requestSchema"]>,
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

export type AddCrawlerData = Crawler;