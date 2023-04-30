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
        const dependence = this._adder.adderManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("adder", [
                    "adder dependence error",
                    `adder ${this._adder.adderManifesto.name} request version is not equal to core version`
                ])
            }
        }
    }

    async addEndpoint() {

        this._turboSearchKit.addEndpoint({
            name: "adder/" + (this._adder.adderManifesto.queryPath || this._adder.adderManifesto.name),
            provider: "core",
            function: async (request: any) => {
                return await this.process(request);
            }
        });

    }


    async setup() {
        await this.init();
        await this.checkSchema();
        await this.checkDependence();
        await this.addEndpoint();
    }

    async process(request: any) {

        const middlewareResult = await this._middlewareManager.processAll(request);

        if (middlewareResult.success) {

            const crawlerResult = await this._crawlerManager.process(middlewareResult.output);

            if (crawlerResult.success) {

                const pipeResult = await this._pipeManager.processAll(middlewareResult.output, crawlerResult.output);

                if (pipeResult.success) {

                    const indexerResult = await this._indexerManager.process(middlewareResult.output, pipeResult.output);

                    if (indexerResult.success) {
                        return { ...indexerResult, ran: ["middleware", "crawler", "pipe", "indexer"] as Ran[] };
                    } else {
                        return { ...pipeResult, ran: ["middleware", "crawler", "pipe"] as Ran[] };
                    }

                } else {
                    return { ...pipeResult, ran: ["middleware", "crawler"] as Ran[] };
                }

            } else {
                return { ...crawlerResult, ran: ["middleware"] as Ran[] };
            }

        } else {
            return { ...middlewareResult, ran: [] as Ran[] };
        }

    }

}