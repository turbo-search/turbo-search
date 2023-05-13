import { SchemaCheck, TurboSearchKit } from "../../../indexType";
import { Pipe, AddPipeData } from "./pipeManagerType";
import { addPipeDataSchema } from "./pipeManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";
import { compareZodSchemas } from "../../../utils/compareZodSchemas";
import { deepEqualZodSchema } from "../../../utils/deepEqualZodSchema";

export class PipeManager {

    private _pipeList: Pipe[] = [];
    private _schemaCheck: SchemaCheck;
    private _turboSearchKit: TurboSearchKit;

    constructor(addPipeDataList: AddPipeData[], schemaCheck: SchemaCheck, turboSearchKit: TurboSearchKit) {

        const result = addPipeDataSchema.safeParse(addPipeDataList);
        if (!result.success) {
            catchError("pipeValidation", ["pipe validation error", result.error.message]);
        } else {
            this._pipeList = addPipeDataList;
        }

        this._schemaCheck = schemaCheck;

        this._turboSearchKit = turboSearchKit;
    }

    get requestSchema() {
        const requestSchema: { [pipeName: string]: any } = {};

        this._pipeList.forEach((pipe) => {
            requestSchema[pipe.pipeManifesto.name] = pipe.requestSchema;
        });

        const zodSchemaList = Object.values(requestSchema);
        const zodSchema = zodSchemaList.reduce((a, b) => a.and(b));

        return zodSchema;
    }

    get inputSchema() {
        if (this._pipeList.length === 0) return undefined;
        return this._pipeList[0].inputSchema;
    }

    get outputSchema() {
        if (this._pipeList.length === 0) return undefined;
        return this._pipeList[this._pipeList.length - 1].outputSchema;
    }

    async init() {
        for (const pipe of this._pipeList) {
            if (pipe.init) {
                await pipe.init(this._turboSearchKit);
            }
        }
    }

    async checkSchema() {

        this._pipeList.forEach((pipe, index) => {
            if (index === this._pipeList.length - 2) {
                return;
            }

            // SchemaCheck == match

            if (this._schemaCheck == "match" && !deepEqualZodSchema(pipe.outputSchema, this._pipeList[index + 1].inputSchema)) {

                catchError("pipeValidation", [
                    "pipe validation error",
                    `pipe ${pipe.pipeManifesto.name} outputSchema is not equal to pipe ${this._pipeList[index + 1].pipeManifesto.name} inputSchema`
                ])

            }

            // SchemaCheck == include

            if (this._schemaCheck == "include" && !compareZodSchemas(pipe.outputSchema, this._pipeList[index + 1].inputSchema)) {

                catchError("pipeValidation", [
                    "pipe validation error",
                    `pipe ${pipe.pipeManifesto.name} outputSchema is not include pipe ${this._pipeList[index + 1].pipeManifesto.name} inputSchema`
                ])
            }
        });

    }

    async checkDependence() {

        this._pipeList.forEach((pipe, index) => {
            const dependence = pipe.pipeManifesto.coreDependence;
            if (dependence && dependence != "") {
                if (!compareDependenceVersion(
                    version,
                    dependence
                )) {
                    catchError("pipeValidation", [
                        "pipe validation error",
                        `pipe ${pipe.pipeManifesto.name} coreDependence is not equal to core version`
                    ])
                }
            }
        });

        await this._pipeList.forEach(async (pipe, index) => {
            const databaseDependence = pipe.pipeManifesto.databaseDependence;
            if (databaseDependence && databaseDependence.length > 0) {

                const databaseName = await this._turboSearchKit.database.getDatabase().databaseManifesto.name;

                const databaseDependenceVersion = databaseDependence.find((dependence) => {
                    return dependence.name == databaseName;
                })?.version;

                if (databaseDependenceVersion && databaseDependenceVersion != "") {
                    if (!compareDependenceVersion(
                        await this._turboSearchKit.database.getDatabase().databaseManifesto.version,
                        databaseDependenceVersion
                    )) {
                        catchError("inserter", [
                            "pipe database dependence error",
                            `pipe ${pipe.pipeManifesto.name} request database version is not equal to database version`
                        ])
                    }
                } else {
                    catchError("inserter", [
                        "pipe database dependence error",
                        `pipe ${pipe.pipeManifesto.name} request database version is not equal to database version`
                    ])
                }

            }

            const extensionDependence = pipe.pipeManifesto.extensionDependence;
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
                                "pipe is dependent on " +
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
                                        "pipe specifies " +
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
        });

    }


    async setup() {
        await this.init();
        await this.checkSchema();
        await this.checkDependence();
    };

    async processAll(requestData: any, inputData: any) {

        let outputData: {
            success: false;
            message: string;
            error: any;
        } | {
            success: true;
            output: any;
        } = {
            success: true,
            output: inputData
        };

        for (const pipe of this._pipeList) {

            if (outputData.success === false) continue;

            outputData = await this.process(requestData, outputData, pipe);

        }

        return outputData;
    }

    async process(requestData: any, inputData: any, pipe: Pipe) {
        const safeRequest = pipe.requestSchema.safeParse(requestData);
        const safeInput = pipe.inputSchema.safeParse(inputData);
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
        } else if (!safeInput.success) {
            return {
                success: false,
                message: "input data validation error",
                error: safeInput.error
            } as {
                success: false;
                message: string;
                error: any;
            }
        } else {
            const result = await pipe.process(safeRequest.data, safeInput.data, this._turboSearchKit);
            return result;
        }
    }

}