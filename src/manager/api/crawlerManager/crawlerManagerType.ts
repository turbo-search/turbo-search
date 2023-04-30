import Z from "zod";
import { DataManagementKit } from "../../../indexType";

export type CrawlerManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddCrawlerData = {
    requestSchema: Z.Schema;
    outputSchema: Z.Schema;
    crawlerManifesto: CrawlerManifesto;
    init?: (dataManagementKit: DataManagementKit) => Promise<void>;
    process: (
        requestData: Z.infer<AddCrawlerData["requestSchema"]>,
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
