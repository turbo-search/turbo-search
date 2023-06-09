import { catchError } from "@/error/catchError";
import { TurboSearchKit } from "@/index";
import { indexerSchema } from "./indexerManagerSchema";
import { compareDependenceVersion } from "@/utils/compareDependenceVersion";
import { version } from "@/version";
import Z from "zod";

export type IndexerManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Indexer = {
  requestSchema: Z.Schema;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  indexerManifesto: IndexerManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  process: (
    requestData: Z.infer<Indexer["requestSchema"]>,
    inputData: Z.infer<Indexer["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | {
      success: false;
      message: string;
      error: any;
    }
    | {
      success: true;
      output: Z.infer<Indexer["outputSchema"]>;
    }
  >;
};

export class IndexerManager {
  private _indexer;
  private _turboSearchKit: TurboSearchKit;

  constructor(addIndexerData: Indexer, turboSearchKit: TurboSearchKit) {
    const result = indexerSchema.safeParse(addIndexerData);
    if (!result.success) {
      catchError("indexerValidation", [
        "indexer validation error",
        result.error.message,
      ]);
      //exit
    } else {
      this._indexer = addIndexerData;
    }

    this._turboSearchKit = turboSearchKit;
  }

  async init() {
    if (this._indexer.init) {
      await this._indexer.init(this._turboSearchKit);
    }
  }

  get requestSchema() {
    return this._indexer.requestSchema;
  }

  get inputSchema() {
    return this._indexer.inputSchema;
  }

  get outputSchema() {
    return this._indexer.outputSchema;
  }

  async checkDependence() {
    const dependence = this._indexer.indexerManifesto.coreDependence;
    if (dependence && dependence != "") {
      if (!compareDependenceVersion(version, dependence)) {
        catchError("indexerValidation", [
          "indexer validation error",
          `indexer ${this._indexer.indexerManifesto.name} version is not equal to core version`,
        ]);
      }
    }

    const databaseDependence =
      this._indexer.indexerManifesto.databaseDependence;
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
            "indexer database dependence error",
            `indexer ${this._indexer.indexerManifesto.name} request database version is not equal to database version`,
          ]);
        }
      } else {
        catchError("inserter", [
          "indexer database dependence error",
          `indexer ${this._indexer.indexerManifesto.name} request database version is not equal to database version`,
        ]);
      }
    }

    const extensionDependence =
      this._indexer.indexerManifesto.extensionDependence;
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
            "indexer is dependent on " + dependenceExtensionName,
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
                "indexer specifies " +
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

  async process(requestData: any, inputData: any) {
    const safeRequest = this._indexer.requestSchema.safeParse(requestData);
    const safeInput = this._indexer.inputSchema.safeParse(inputData);
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
    } else if (!safeInput.success) {
      return {
        success: false,
        message: "input data validation error",
        error: safeInput.error,
      } as {
        success: false;
        message: string;
        error: any;
      };
    } else {
      const result = await this._indexer.process(
        safeRequest.data,
        safeInput.data,
        this._turboSearchKit
      );
      return result;
    }
  }
}
