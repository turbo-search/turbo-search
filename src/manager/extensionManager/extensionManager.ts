import { catchError } from "../../error/catchError.js";
import {
  ExtensionSetupKit,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "../../indexType.js";
import { compareDependenceVersion } from "../../utils/compareDependenceVersion.js";
import { version } from "../../version.js";
import { Extension } from "./extensionManagerType.js";
import { addExtensionSchema } from "./extensionSchema.js";

export class ExtensionManager {
  private _error;
  private _extensions;
  private _extensionSetupKit;

  constructor(
    extensions: Extension[],
    error: TurboSearchCoreOptions["error"],
    extensionSetupKit: ExtensionSetupKit
  ) {
    this._error = error;
    this._extensions = extensions;
    this._extensionSetupKit = extensionSetupKit;
  }

  //extensionのバリデーション
  validate() {
    this._extensions.forEach((extension, index) => {
      //zodでバリデーション
      const result = addExtensionSchema.safeParse(extension);
      if (!result.success) {
        catchError("extensionValidation", [
          "extension validation error",
          "extension name is " + extension.manifesto.name,
          "error is " + result.error.message,
        ]);
      }
    });
  }

  //同じ名前の拡張機能がないかどうかチェック
  checkDuplicateExtensionName() {
    const extensionNames = this._extensions.map(
      (extension) => extension.manifesto.name
    );
    const duplicateExtensionNames = extensionNames.filter(
      (name, index) => extensionNames.indexOf(name) !== index
    );
    if (duplicateExtensionNames.length > 0) {
      catchError("manifesto", [
        "Duplicate extension name",
        "Duplicate extension name is " + duplicateExtensionNames.join(", "),
      ]);
    }
  }

  //check extensions manifesto
  checkManifesto() {
    this._extensions.forEach((extension, index) => {
      if (!extension.manifesto || !extension.manifesto.name) {
        catchError("manifesto", [
          "extension manifesto error",
          "extension index is " + index,
        ]);
      }
    });
  }

  //extensions available check
  checkAvailable() {
    this._extensions.map((extension) => {
      if (typeof extension.available !== "function") {
        return true;
      } else {
        const extensionAvailable = extension.available();
        if (extensionAvailable.success) {
          return true;
        } else {
          if (
            typeof this._error == "object" &&
            "boolean" &&
            this._error.strictAvailable
          ) {
            catchError("available", [
              extension.manifesto.name + " is not available",
            ]);
          } else {
            //TODO:Error Log
          }
        }
      }
    });
  }

  //dependencies check
  checkDependence() {
    this._extensions.forEach((extension) => {
      if (extension.manifesto.coreDependence) {
        if (
          extension.manifesto.coreDependence !== "" &&
          !compareDependenceVersion(
            version,
            extension.manifesto.coreDependence
          )
        ) {
          catchError("dependence", [
            extension.manifesto.name + " coreDependence is not match",
            "Requested Version : " + extension.manifesto.coreDependence,
            "Current version : " + version,
          ]);
        }
      }

      //依存している拡張機能があるかチェック
      if (
        extension.manifesto.dependence &&
        typeof extension.manifesto.dependence !== "undefined" &&
        Object.keys(extension.manifesto.dependence).length > 0
      ) {
        Object.keys(extension.manifesto.dependence).forEach(
          (dependenceExtensionName) => {
            // 依存している拡張機能の情報
            const dependenceExtension = this._extensions.find(
              (extension) =>
                extension.manifesto.name === dependenceExtensionName
            );
            if (!dependenceExtension) {
              catchError("dependence", [
                extension.manifesto.name +
                " is dependent on " +
                dependenceExtensionName,
                "The following solutions are available",
                "Add the extension : " + dependenceExtensionName,
                "Remove the extension : " + extension.manifesto.name,
              ]);
            } else {
              // 依存関係のバージョンチェック
              if (extension.manifesto.dependence) {
                if (
                  extension.manifesto.dependence[dependenceExtensionName] !==
                  "" &&
                  !compareDependenceVersion(
                    dependenceExtension.manifesto.version,
                    extension.manifesto.dependence[dependenceExtensionName]
                  )
                ) {
                  catchError("dependence", [
                    "Extension:" +
                    extension.manifesto.name +
                    " specifies " +
                    dependenceExtensionName +
                    " version " +
                    extension.manifesto.dependence[dependenceExtensionName] +
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
          }
        );
      }
    });
  }

  //extensions loader & add task , endpoint
  load() {
    this._extensions.forEach((extension) => {
      if (typeof extension.init === "function") {
        extension.init(this._extensionSetupKit);
      }
    });
  }

  //get extensions
  getExtensions() {
    return this._extensions;
  }

  //setup extensions
  setupExtensions() {
    this.validate();
    this.checkDuplicateExtensionName();
    this.checkManifesto();
    this.checkAvailable();
    this.checkDependence();
    this.load();
  }
}
