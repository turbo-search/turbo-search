import { catchError } from '../../error/catchError.js';
import { DataManagementKit, SchemaCheck, TurboSearchKit } from '../../indexType.js';
import { compareDependenceVersion } from '../../utils/compareDependenceVersion.js';
import { version } from '../../version.js';
import { RankerManager } from '../api/rankerManager/rankerManager.js';
import { InterceptorManager } from '../api/interceptorManager/interceptorManager.js';
import { MiddlewareManager } from '../api/middlewareManager/middlewareManager.js';
import { PipeManager } from '../api/pipeManager/pipeManager.js';
import { addSearcherDataSchema } from './searcherManagerSchema.js';
import type { AddSearcherData, Searcher, Ran } from './searcherManagerType.js';
import { compareZodSchemas } from '../../utils/compareZodSchemas.js';
import { deepEqualZodSchema } from '../../utils/deepEqualZodSchema.js';

export class SearcherManager {

    private _searcher: Searcher;
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;
    private _middlewareManager: MiddlewareManager;
    private _rankerManager: RankerManager;
    private _pipeManager: PipeManager;
    private _interceptorManager: InterceptorManager;
    private _turboSearchKit: TurboSearchKit;


    constructor(addSearcherData: AddSearcherData, dataManagementKit: DataManagementKit, turboSearchKit: TurboSearchKit, schemaCheck: SchemaCheck) {

        const result = addSearcherDataSchema.safeParse(addSearcherData);

        if (!result.success) {
            catchError("searcher", ["searcher validation error", result.error.message]);
        } else {
            this._searcher = result.data as unknown as Searcher;
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;

        this._turboSearchKit = turboSearchKit;

        this._middlewareManager = new MiddlewareManager(this._searcher.middleware, this._dataManagementKit, this._turboSearchKit);

        this._rankerManager = new RankerManager(this._searcher.ranker, this._dataManagementKit, this._turboSearchKit);

        this._pipeManager = new PipeManager(this._searcher.pipe, this._dataManagementKit, this._schemaCheck, this._turboSearchKit);

        this._interceptorManager = new InterceptorManager(this._searcher.interceptor, this._dataManagementKit, this._turboSearchKit);

    }

    async checkSchema() {

        const outputRankerSchema = this._rankerManager.outputSchema;
        const inputPipeSchema = this._pipeManager.inputSchema;
        const outputPipeSchema = this._pipeManager.outputSchema;
        const inputInterceptorSchema = this._interceptorManager.inputSchema;

        if (this._schemaCheck == "match") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!deepEqualZodSchema(outputRankerSchema, inputPipeSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputRankerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!deepEqualZodSchema(outputPipeSchema, inputInterceptorSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputPipeSchema is not equal to inputInterceptorSchema`
                    ])
                }

            } else {

                if (!deepEqualZodSchema(outputRankerSchema, inputInterceptorSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputRankerSchema is not equal to inputInterceptorSchema`
                    ])
                }

            }

        }

        if (this._schemaCheck == "include") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!compareZodSchemas(inputPipeSchema, outputRankerSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputRankerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!compareZodSchemas(inputInterceptorSchema, outputPipeSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputPipeSchema is not equal to inputInterceptorSchema`
                    ])
                }

            } else {

                if (!compareZodSchemas(inputInterceptorSchema, outputRankerSchema)) {
                    catchError("searcher", [
                        "searcher schema error",
                        `searcher ${this._searcher.searcherManifesto.name} outputRankerSchema is not equal to inputInterceptorSchema`
                    ])
                }

            }

        }

    }

    async init() {
        if (this._searcher.init) {
            await this._searcher.init(this._dataManagementKit);
        }

    }

    async addEndpoint() {

        await this._turboSearchKit.addEndpoint({
            name: "searcher",
            provider: "core",
            function: async (request: any) => {
                return await this.process(request);
            }
        })

    }

    async checkDependence() {
        const dependence = this._searcher.searcherManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("searcher", [
                    "searcher dependence error",
                    `searcher ${this._searcher.searcherManifesto.name} request version is not equal to core version`
                ])
            }
        }

        const databaseDependence = this._searcher.searcherManifesto.databaseDependence;
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
                        "searcher database dependence error",
                        `searcher ${this._searcher.searcherManifesto.name} request database version is not equal to database version`
                    ])
                }
            } else {
                catchError("adder", [
                    "searcher database dependence error",
                    `searcher ${this._searcher.searcherManifesto.name} request database version is not equal to database version`
                ])
            }

        }

        const extensionDependence = this._searcher.searcherManifesto.extensionDependence;
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
                            "searcher is dependent on " +
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
                                    "searcher specifies " +
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
        await this._middlewareManager.setup();
        await this._rankerManager.setup();
        await this._pipeManager.setup();
        await this._interceptorManager.setup();

        await this.init();
        await this.checkSchema();
        await this.checkDependence();
        await this.addEndpoint();
    }

    async process(request: any) {

        const middlewareResult = await this._middlewareManager.processAll(request);

        //TODO:エラー処理をzodに書き換える

        if (middlewareResult.success) {

            const rankerResult = await this._rankerManager.process(middlewareResult.output);

            if (rankerResult.success) {

                const pipeResult = await this._pipeManager.processAll(middlewareResult.output, rankerResult.output);

                if (pipeResult.success) {

                    const interceptorResult = await this._interceptorManager.process(middlewareResult.output, pipeResult.output);

                    if (interceptorResult.success) {
                        return { ...interceptorResult, ran: ["middleware", "ranker", "pipe", "interceptor"] as Ran[] };
                    } else {
                        if (interceptorResult.success == false && interceptorResult.message) {
                            return { ...interceptorResult, ran: [] as Ran[] };
                        } else {
                            if (interceptorResult.error) {
                                return { success: false, message: "middleware error", error: interceptorResult.error, ran: ["middleware", "ranker", "pipe",] as Ran[] }
                            } else {
                                return { success: false, message: "middleware error", ran: ["middleware", "ranker", "pipe",] as Ran[] }
                            }
                        }
                    }

                } else {

                    if (pipeResult.success == false && pipeResult.message) {
                        return { ...pipeResult, ran: [] as Ran[] };
                    } else {
                        if (pipeResult.error) {
                            return { success: false, message: "middleware error", error: pipeResult.error, ran: ["middleware", "ranker"] as Ran[] }
                        } else {
                            return { success: false, message: "middleware error", ran: ["middleware", "ranker"] as Ran[] }
                        }
                    }

                }

            } else {

                if (rankerResult.success == false && rankerResult.message) {
                    return { ...rankerResult, ran: [] as Ran[] };
                } else {
                    if (rankerResult.error) {
                        return { success: false, message: "middleware error", error: rankerResult.error, ran: ["middleware"] as Ran[] }
                    } else {
                        return { success: false, message: "middleware error", ran: ["middleware"] as Ran[] }
                    }
                }

            }

        } else {

            if (middlewareResult.success == false && middlewareResult.message) {
                return { ...middlewareResult, ran: [] as Ran[] };
            } else {
                if (middlewareResult.error) {
                    return { success: false, message: "middleware error", error: middlewareResult.error, ran: [] as Ran[] }
                } else {
                    return { success: false, message: "middleware error", ran: [] as Ran[] }
                }
            }

        }

    }

}