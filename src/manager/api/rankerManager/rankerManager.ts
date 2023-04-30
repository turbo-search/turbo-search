import { catchError } from "../../../error/catchError";
import { DataManagementKit, TurboSearchKit } from "../../../indexType";
import { addRankerDataSchema } from "./rankerManagerSchema";
import { AddRankerData } from "./rankerManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class RankerManager {

    private _ranker;
    private _dataManagementKit: DataManagementKit;
    private _turboSearchKit: TurboSearchKit;

    constructor(addRankerData: AddRankerData, dataManagementKit: DataManagementKit, TurboSearchKit: TurboSearchKit) {
        const result = addRankerDataSchema.safeParse(addRankerData);
        if (!result.success) {
            catchError("rankerValidation", ["ranker validation error", result.error.message]);
            //exit
        } else {
            this._ranker = addRankerData;
        }

        this._dataManagementKit = dataManagementKit;

        this._turboSearchKit = TurboSearchKit;
    }

    async init() {
        if (this._ranker.init) {
            await this._ranker.init(this._dataManagementKit);
        }
    }

    get requestSchema() {
        return this._ranker.requestSchema;
    }

    get outputSchema() {
        return this._ranker.outputSchema;
    }

    async checkDependence() {
        const dependence = this._ranker.rankerManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("rankerValidation", [
                    "ranker validation error",
                    `ranker ${this._ranker.rankerManifesto.name} version is not equal to core version`
                ])
            }
        }

        const databaseDependence = this._ranker.rankerManifesto.databaseDependence;
        if (databaseDependence && databaseDependence.length > 0) {

            const databaseName = await this._dataManagementKit.database.getDatabase().databaseManifesto.name;

            const databaseDependenceVersion = databaseDependence.find((dependence) => {
                return dependence.name == databaseName;
            })?.version;

            if (databaseDependenceVersion && databaseDependenceVersion != "") {
                if (!compareDependenceVersion(
                    await this._dataManagementKit.database.getDatabase().databaseManifesto.version,
                    databaseDependenceVersion
                )) {
                    catchError("adder", [
                        "ranker database dependence error",
                        `ranker ${this._ranker.rankerManifesto.name} request database version is not equal to database version`
                    ])
                }
            } else {
                catchError("adder", [
                    "ranker database dependence error",
                    `ranker ${this._ranker.rankerManifesto.name} request database version is not equal to database version`
                ])
            }

        }

        const extensionDependence = this._ranker.rankerManifesto.extensionDependence;
        //依存している拡張機能があるかチェック
        if (
            extensionDependence &&
            typeof extensionDependence !== "undefined" &&
            Object.keys(extensionDependence).length > 0
        ) {
            Object.keys(extensionDependence).forEach(
                (dependenceExtensionName) => {
                    // 依存している拡張機能の情報
                    const dependenceExtension = this._turboSearchKit.extensions.find(
                        (extension) =>
                            extension.manifesto.name === dependenceExtensionName
                    );
                    if (!dependenceExtension) {
                        catchError("dependence", [
                            "ranker is dependent on " +
                            dependenceExtensionName,
                            "The following solutions are available",
                            "Add the extension : " + dependenceExtensionName,
                        ]);
                    } else {
                        // 依存関係のバージョンチェック
                        if (extensionDependence) {
                            if (
                                extensionDependence[dependenceExtensionName] !==
                                "" &&
                                !compareDependenceVersion(
                                    dependenceExtension.manifesto.version,
                                    extensionDependence[dependenceExtensionName]
                                )
                            ) {
                                catchError("dependence", [
                                    "ranker specifies " +
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
                }
            );
        }

    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(requestData: any) {
        const safeRequest = this._ranker.requestSchema.safeParse(requestData);
        if (!safeRequest.success) {
            return {
                success: false,
                message: "input data validation error",
                error: safeRequest.error
            } as {
                success: false;
                message: string;
                error: any;
            }
        } else {
            const result = await this._ranker.process(safeRequest.data, this._dataManagementKit);
            return result;
        }
    }

}