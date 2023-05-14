import { TurboSearchKit } from "../../../indexType";
import { Middleware } from "./middlewareManagerType";
import { middlewareSchema } from "./middlewareManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class MiddlewareManager {
  private _middlewareList: Middleware[] = [];
  private _turboSearchKit: TurboSearchKit;

  constructor(
    addMiddlewareDataList: Middleware[],
    TurboSearchKit: TurboSearchKit
  ) {
    const result = middlewareSchema.safeParse(addMiddlewareDataList);
    if (!result.success) {
      catchError("middlewareValidation", [
        "middleware validation error",
        result.error.message,
      ]);
    } else {
      this._middlewareList = addMiddlewareDataList;
    }

    this._turboSearchKit = TurboSearchKit;
  }

  async init() {
    for (const middleware of this._middlewareList) {
      if (middleware.init) {
        await middleware.init(this._turboSearchKit);
      }
    }
  }

  async checkDependence() {
    this._middlewareList.forEach((middleware, index) => {
      const dependence = middleware.middlewareManifesto.coreDependence;
      if (dependence && dependence != "") {
        if (!compareDependenceVersion(version, dependence)) {
          catchError("middlewareValidation", [
            "middleware validation error",
            `middleware ${middleware.middlewareManifesto.name} coreDependence is not equal to core version`,
          ]);
        }
      }
    });

    await this._middlewareList.forEach(async (middleware, index) => {
      const databaseDependence =
        middleware.middlewareManifesto.databaseDependence;
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
              await this._turboSearchKit.database.getDatabase()
                .databaseManifesto.version,
              databaseDependenceVersion
            )
          ) {
            catchError("inserter", [
              "middleware database dependence error",
              `middleware ${middleware.middlewareManifesto.name} request database version is not equal to database version`,
            ]);
          }
        } else {
          catchError("inserter", [
            "middleware database dependence error",
            `middleware ${middleware.middlewareManifesto.name} request database version is not equal to database version`,
          ]);
        }
      }

      const extensionDependence =
        middleware.middlewareManifesto.extensionDependence;
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
              "middleware is dependent on " + dependenceExtensionName,
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
                  "middleware specifies " +
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
    });
  }

  async setup() {
    await this.init();
    await this.checkDependence();
  }

  async processAll(inputData: any) {
    let outputData: any = {
      success: true,
      output: inputData,
    };

    for (const middleware of this._middlewareList) {
      if (outputData.success === false) return;

      const result = await this.process(outputData, middleware);
      if (result.success) {
        outputData = result.output;
      } else {
        return result;
      }
    }

    return outputData;
  }

  async process(inputData: any, middleware: Middleware) {
    const result = await middleware.process(inputData, this._turboSearchKit);
    return result;
  }
}
