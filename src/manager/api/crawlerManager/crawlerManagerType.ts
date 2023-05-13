import Z from "zod";
import { TurboSearchKit } from "../../..";

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
    init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
    process: (
        requestData: Z.infer<Crawler["requestSchema"]>,
        turboSearchKit: TurboSearchKit
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