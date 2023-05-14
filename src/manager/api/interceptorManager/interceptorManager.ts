import { TurboSearchKit } from "@/index";
import { catchError } from "@/error/catchError";
import { interceptorSchema } from "./interceptorManagerSchema";
import { compareDependenceVersion } from "@/utils/compareDependenceVersion";
import { version } from "@/version";
import Z from "zod";

export type InterceptorManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Interceptor = {
  requestSchema: Z.Schema;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  interceptorManifesto: InterceptorManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  process: (
    requestData: Z.infer<Interceptor["requestSchema"]>,
    inputData: Z.infer<Interceptor["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | {
      success: false;
      message: string;
      error: any;
    }
    | {
      success: true;
      output: Z.infer<Interceptor["outputSchema"]>;
    }
  >;
};


export class InterceptorManager {
  private _interceptor;
  private _turboSearchKit: TurboSearchKit;

  constructor(
    addInterceptorData: Interceptor,
    turboSearchKit: TurboSearchKit
  ) {
    const result = interceptorSchema.safeParse(addInterceptorData);
    if (!result.success) {
      catchError("interceptorValidation", [
        "interceptor validation error",
        result.error.message,
      ]);
      //exit
    } else {
      this._interceptor = addInterceptorData;
    }

    this._turboSearchKit = turboSearchKit;
  }

  async init() {
    if (this._interceptor.init) {
      await this._interceptor.init(this._turboSearchKit);
    }
  }

  get requestSchema() {
    return this._interceptor.requestSchema;
  }

  get inputSchema() {
    return this._interceptor.inputSchema;
  }

  get outputSchema() {
    return this._interceptor.outputSchema;
  }

  async checkDependence() {
    const dependence = this._interceptor.interceptorManifesto.coreDependence;
    if (dependence && dependence != "") {
      if (!compareDependenceVersion(version, dependence)) {
        catchError("interceptorValidation", [
          "interceptor validation error",
          `interceptor ${this._interceptor.interceptorManifesto.name} version is not equal to core version`,
        ]);
      }
    }

    const databaseDependence =
      this._interceptor.interceptorManifesto.databaseDependence;
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
            "interceptor database dependence error",
            `interceptor ${this._interceptor.interceptorManifesto.name} request database version is not equal to database version`,
          ]);
        }
      } else {
        catchError("inserter", [
          "interceptor database dependence error",
          `interceptor ${this._interceptor.interceptorManifesto.name} request database version is not equal to database version`,
        ]);
      }
    }

    const extensionDependence =
      this._interceptor.interceptorManifesto.extensionDependence;
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
            "interceptor is dependent on " + dependenceExtensionName,
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
                "interceptor specifies " +
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
    const safeRequest = this._interceptor.requestSchema.safeParse(requestData);
    const safeInput = this._interceptor.inputSchema.safeParse(inputData);
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
      const result = await this._interceptor.process(
        safeRequest.data,
        safeInput.data,
        this._turboSearchKit
      );
      return result;
    }
  }
}
