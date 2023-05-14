import { catchError } from "@/error/catchError";
import { TurboSearchKit } from "@/index";
import { crawlerSchema } from "./crawlerManagerSchema";
import { compareDependenceVersion } from "@/utils/compareDependenceVersion";
import { version } from "@/version";
import Z from "zod";

export type CrawlerManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Crawler = {
  requestSchema: Z.Schema;
  outputSchema: Z.Schema;
  crawlerManifesto: CrawlerManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  process: (
    requestData: Z.infer<Crawler["requestSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | {
      success: false;
      message: string;
      error: any;
    }
    | {
      success: true;
      output: Z.infer<Crawler["outputSchema"]>;
    }
  >;
};


export class CrawlerManager {
  private _crawler;
  private _turboSearchKit: TurboSearchKit;

  constructor(addCrawlerData: Crawler, turboSearchKit: TurboSearchKit) {
    const result = crawlerSchema.safeParse(addCrawlerData);
    if (!result.success) {
      catchError("crawlerValidation", [
        "crawler validation error",
        result.error.message,
      ]);
      //exit
    } else {
      this._crawler = addCrawlerData;
    }

    this._turboSearchKit = turboSearchKit;
  }

  async init() {
    if (this._crawler.init) {
      await this._crawler.init(this._turboSearchKit);
    }
  }

  get requestSchema() {
    return this._crawler.requestSchema;
  }

  get outputSchema() {
    return this._crawler.outputSchema;
  }

  async checkDependence() {
    const dependence = this._crawler.crawlerManifesto.coreDependence;
    if (dependence && dependence != "") {
      if (!compareDependenceVersion(version, dependence)) {
        catchError("crawlerValidation", [
          "crawler validation error",
          `crawler ${this._crawler.crawlerManifesto.name} version is not equal to core version`,
        ]);
      }
    }

    const databaseDependence =
      this._crawler.crawlerManifesto.databaseDependence;
    if (databaseDependence && databaseDependence.length > 0) {
      const databaseName = await this._turboSearchKit.database.getDatabase()
        .databaseManifesto.name;

      const databaseDependenceVersion = databaseDependence.find(
        (dependence) => {
          return dependence.name == databaseName;
        }
      )?.version;

      if (databaseDependenceVersion && databaseDependenceVersion != "") {
        if (
          !compareDependenceVersion(
            await this._turboSearchKit.database.getDatabase().databaseManifesto
              .version,
            databaseDependenceVersion
          )
        ) {
          catchError("inserter", [
            "crawler database dependence error",
            `crawler ${this._crawler.crawlerManifesto.name} request database version is not equal to database version`,
          ]);
        }
      } else {
        catchError("inserter", [
          "crawler database dependence error",
          `crawler ${this._crawler.crawlerManifesto.name} request database version is not equal to database version`,
        ]);
      }
    }

    const extensionDependence =
      this._crawler.crawlerManifesto.extensionDependence;
    //依存している拡張機能があるかチェック
    if (
      extensionDependence &&
      typeof extensionDependence !== "undefined" &&
      Object.keys(extensionDependence).length > 0
    ) {
      Object.keys(extensionDependence).forEach((dependenceExtensionName) => {
        // 依存している拡張機能の情報
        const dependenceExtension = this._turboSearchKit.extensions.find(
          (extension) => extension.manifesto.name === dependenceExtensionName
        );
        if (!dependenceExtension) {
          catchError("dependence", [
            "crawler is dependent on " + dependenceExtensionName,
            "The following solutions are available",
            "Add the extension : " + dependenceExtensionName,
          ]);
        } else {
          // 依存関係のバージョンチェック
          if (extensionDependence) {
            if (
              extensionDependence[dependenceExtensionName] !== "" &&
              !compareDependenceVersion(
                dependenceExtension.manifesto.version,
                extensionDependence[dependenceExtensionName]
              )
            ) {
              catchError("dependence", [
                "crawler specifies " +
                dependenceExtensionName +
                " version " +
                extensionDependence[dependenceExtensionName] +
                ".",
                "The current version of " +
                dependenceExtensionName +
                " is " +
                dependenceExtension.manifesto.version +
                ".",
              ]);
            }
          }
        }
      });
    }
  }

  async setup() {
    await this.init();
    await this.checkDependence();
  }

  async process(requestData: any) {
    const safeRequest = this._crawler.requestSchema.safeParse(requestData);
    if (!safeRequest.success) {
      return {
        success: false,
        message: "input data validation error",
        error: safeRequest.error,
      } as {
        success: false;
        message: string;
        error: any;
      };
    } else {
      const result = await this._crawler.process(
        safeRequest.data,
        this._turboSearchKit
      );
      return result;
    }
  }
}
