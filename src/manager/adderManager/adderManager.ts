import { catchError } from '../../error/catchError.js';
import { DataManagementKit, SchemaCheck, TurboSearchKit } from '../../indexType.js';
import { compareDependenceVersion } from '../../utils/compareDependenceVersion.js';
import { version } from '../../version.js';
import { CrawlerManager } from '../api/crawlerManager/crawlerManager.js';
import { IndexerManager } from '../api/indexerManager/indexerManager.js';
import { MiddlewareManager } from '../api/middlewareManager/middlewareManager.js';
import { PipeManager } from '../api/pipeManager/pipeManager.js';
import { addAdderDataSchema } from './adderManagerSchema.js';
import type { AddAdderData, Adder, Ran } from './adderManagerType.js';
import { compareZodSchemas } from '../../utils/compareZodSchemas.js';
import { deepEqualZodSchema } from '../../utils/deepEqualZodSchema.js';

export class AdderManager {

    private _adder: Adder;
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;
    private _middlewareManager: MiddlewareManager;
    private _crawlerManager: CrawlerManager;
    private _pipeManager: PipeManager;
    private _indexerManager: IndexerManager;
    private _turboSearchKit: TurboSearchKit;


    constructor(addAdderData: AddAdderData, dataManagementKit: DataManagementKit, turboSearchKit: TurboSearchKit, schemaCheck: SchemaCheck) {

        const result = addAdderDataSchema.safeParse(addAdderData);

        if (!result.success) {
            catchError("adder", ["adder validation error", result.error.message]);
        } else {
            this._adder = result.data as unknown as Adder;
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;

        this._middlewareManager = new MiddlewareManager(this._adder.middleware, this._dataManagementKit);

        this._crawlerManager = new CrawlerManager(this._adder.crawler, this._dataManagementKit);

        this._pipeManager = new PipeManager(this._adder.pipe, this._dataManagementKit, this._schemaCheck);

        this._indexerManager = new IndexerManager(this._adder.indexer, this._dataManagementKit);

        this._turboSearchKit = turboSearchKit;

    }

    async checkSchema() {

        const outputCrawlerSchema = this._crawlerManager.outputSchema;
        const inputPipeSchema = this._pipeManager.inputSchema;
        const outputPipeSchema = this._pipeManager.outputSchema;
        const inputIndexerSchema = this._indexerManager.inputSchema;

        if (this._schemaCheck == "match") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!deepEqualZodSchema(outputCrawlerSchema, inputPipeSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!deepEqualZodSchema(outputPipeSchema, inputIndexerSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (!deepEqualZodSchema(outputCrawlerSchema, inputIndexerSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputIndexerSchema`
                    ])
                }

            }

        }

        if (this._schemaCheck == "include") {

            if (inputPipeSchema && outputPipeSchema) {

                if (!compareZodSchemas(inputPipeSchema, outputCrawlerSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (!compareZodSchemas(inputIndexerSchema, outputPipeSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (!compareZodSchemas(inputIndexerSchema, outputCrawlerSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputIndexerSchema`
                    ])
                }

            }

        }

    }

    async init() {
        if (this._adder.init) {
            await this._adder.init(this._dataManagementKit);
        }
    }

    async checkDependence() {
        const coreDependence = this._adder.adderManifesto.coreDependence;
        if (coreDependence && coreDependence != "") {
            if (!compareDependenceVersion(
                version,
                coreDependence
            )) {
                catchError("adder", [
                    "adder core dependence error",
                    `adder ${this._adder.adderManifesto.name} request version is not equal to core version`
                ])
            }
        }

        const databaseDependence = this._adder.adderManifesto.databaseDependence;
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
                        "adder database dependence error",
                        `adder ${this._adder.adderManifesto.name} request database version is not equal to database version`
                    ])
                }
            } else {
                catchError("adder", [
                    "adder database dependence error",
                    `adder ${this._adder.adderManifesto.name} request database version is not equal to database version`
                ])
            }

        }

        const extensionDependence = this._adder.adderManifesto.extensionDependence;
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
                            "adder is dependent on " +
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
                                    "adder specifies " +
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
            name: "adder/" + (this._adder.adderManifesto.queryPath || this._adder.adderManifesto.name),
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