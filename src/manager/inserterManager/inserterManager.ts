import { catchError } from '../../error/catchError.js';
import { DataManagementKit, SchemaCheck, TurboSearchKit } from '../../indexType.js';
import { compareDependenceVersion } from '../../utils/compareDependenceVersion.js';
import { version } from '../../version.js';
import { CrawlerManager } from '../api/crawlerManager/crawlerManager.js';
import { IndexerManager } from '../api/indexerManager/indexerManager.js';
import { MiddlewareManager } from '../api/middlewareManager/middlewareManager.js';
import { PipeManager } from '../api/pipeManager/pipeManager.js';
import { addInserterDataSchema } from './inserterManagerSchema.js';
import type { AddInserterData, Inserter, Ran } from './inserterManagerType.js';
import { compareZodSchemas } from '../../utils/compareZodSchemas.js';
import { deepEqualZodSchema } from '../../utils/deepEqualZodSchema.js';

export class InserterManager {

    private _inserter: Inserter;
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;
    private _middlewareManager: MiddlewareManager;
    private _crawlerManager: CrawlerManager;
    private _pipeManager: PipeManager;
    private _indexerManager: IndexerManager;
    private _turboSearchKit: TurboSearchKit;


    constructor(addInserterData: AddInserterData, dataManagementKit: DataManagementKit, turboSearchKit: TurboSearchKit, schemaCheck: SchemaCheck) {

        const result = addInserterDataSchema.safeParse(addInserterData);

        if (!result.success) {
            catchError("inserter", ["inserter validation error", result.error.message]);
        } else {
            this._inserter = result.data as unknown as Inserter;
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;

        this._turboSearchKit = turboSearchKit;

        this._middlewareManager = new MiddlewareManager(this._inserter.middleware, this._dataManagementKit, this._turboSearchKit);

        this._crawlerManager = new CrawlerManager(this._inserter.crawler, this._dataManagementKit, this._turboSearchKit);

        this._pipeManager = new PipeManager(this._inserter.pipe, this._dataManagementKit, this._schemaCheck, this._turboSearchKit);

        this._indexerManager = new IndexerManager(this._inserter.indexer, this._dataManagementKit, this._turboSearchKit);

    }

    async checkSchema() {

        const outputCrawlerSchema = this._crawlerManager.outputSchema;
        const inputPipeSchema = this._pipeManager.inputSchema;
        const outputPipeSchema = this._pipeManager.outputSchema;
        const inputIndexerSchema = this._indexerManager.inputSchema;

        if (this._schemaCheck == "match") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!deepEqualZodSchema(outputCrawlerSchema, inputPipeSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!deepEqualZodSchema(outputPipeSchema, inputIndexerSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (!deepEqualZodSchema(outputCrawlerSchema, inputIndexerSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputCrawlerSchema is not equal to inputIndexerSchema`
                    ])
                }

            }

        }

        if (this._schemaCheck == "include") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!compareZodSchemas(inputPipeSchema, outputCrawlerSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!compareZodSchemas(inputIndexerSchema, outputPipeSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (!compareZodSchemas(inputIndexerSchema, outputCrawlerSchema)) {
                    catchError("inserter", [
                        "inserter schema error",
                        `inserter ${this._inserter.inserterManifesto.name} outputCrawlerSchema is not equal to inputIndexerSchema`
                    ])
                }

            }

        }

    }

    async init() {
        if (this._inserter.init) {
            await this._inserter.init(this._dataManagementKit);
        }
    }

    async checkDependence() {
        const coreDependence = this._inserter.inserterManifesto.coreDependence;
        if (coreDependence && coreDependence != "") {
            if (!compareDependenceVersion(
                version,
                coreDependence
            )) {
                catchError("inserter", [
                    "inserter core dependence error",
                    `inserter ${this._inserter.inserterManifesto.name} request version is not equal to core version`
                ])
            }
        }

        const databaseDependence = this._inserter.inserterManifesto.databaseDependence;
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
                    catchError("inserter", [
                        "inserter database dependence error",
                        `inserter ${this._inserter.inserterManifesto.name} request database version is not equal to database version`
                    ])
                }
            } else {
                catchError("inserter", [
                    "inserter database dependence error",
                    `inserter ${this._inserter.inserterManifesto.name} request database version is not equal to database version`
                ])
            }

        }

        const extensionDependence = this._inserter.inserterManifesto.extensionDependence;
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
                            "inserter is dependent on " +
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
                                    "inserter specifies " +
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

    async addEndpoint() {

        await this._turboSearchKit.addEndpoint({
            name: "inserter/" + (this._inserter.inserterManifesto.queryPath || this._inserter.inserterManifesto.name),
            provider: "core",
            function: async (request: any) => {
                return await this.process(request);
            }
        });

    }


    async setup() {
        await this._middlewareManager.setup();
        await this._crawlerManager.setup();
        await this._pipeManager.setup();
        await this._indexerManager.setup();

        await this.init();
        await this.checkSchema();
        await this.checkDependence();
        await this.addEndpoint();
    }

    async process(request: any) {

        const middlewareResult = await this._middlewareManager.processAll(request);

        //TODO:エラー処理をzodに書き換える

        if (middlewareResult.success) {

            const crawlerResult = await this._crawlerManager.process(middlewareResult.output);

            if (crawlerResult.success) {

                const pipeResult = await this._pipeManager.processAll(middlewareResult.output, crawlerResult.output);

                if (pipeResult.success) {

                    const indexerResult = await this._indexerManager.process(middlewareResult.output, pipeResult.output);

                    if (indexerResult.success) {
                        return { ...indexerResult, ran: ["middleware", "crawler", "pipe", "indexer"] as Ran[] };
                    } else {
                        if (indexerResult.success == false && indexerResult.message) {
                            return { ...indexerResult, ran: [] as Ran[] };
                        } else {
                            if (indexerResult.error) {
                                return { success: false, message: "middleware error", error: indexerResult.error, ran: ["middleware", "crawler", "pipe",] as Ran[] }
                            } else {
                                return { success: false, message: "middleware error", ran: ["middleware", "crawler", "pipe",] as Ran[] }
                            }
                        }
                    }

                } else {

                    if (pipeResult.success == false && pipeResult.message) {
                        return { ...pipeResult, ran: [] as Ran[] };
                    } else {
                        if (pipeResult.error) {
                            return { success: false, message: "middleware error", error: pipeResult.error, ran: ["middleware", "crawler"] as Ran[] }
                        } else {
                            return { success: false, message: "middleware error", ran: ["middleware", "crawler"] as Ran[] }
                        }
                    }

                }

            } else {

                if (crawlerResult.success == false && crawlerResult.message) {
                    return { ...crawlerResult, ran: [] as Ran[] };
                } else {
                    if (crawlerResult.error) {
                        return { success: false, message: "middleware error", error: crawlerResult.error, ran: ["middleware"] as Ran[] }
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