import z from 'zod';
import { catchError } from '../../error/catchError.js';
import { DataManagementKit, SchemaCheck } from '../../indexType.js';
import { compareDependenceVersion } from '../../utils/compareDependenceVersion.js';
import { version } from '../../version.js';
import { crawlerManager } from '../api/crawlerManager/crawlerManager.js';
import { CrawlerManager } from '../api/crawlerManager/crawlerManagerType.js';
import { indexerManager } from '../api/indexerManager/indexerManager.js';
import { IndexerManager } from '../api/indexerManager/indexerManagerType.js';
import { middlewareManager } from '../api/middlewareManager/middlewareManager.js';
import { MiddlewareManager } from '../api/middlewareManager/middlewareManagerType.js';
import { pipeManager } from '../api/pipeManager/pipeManager.js';
import { PipeManager } from '../api/pipeManager/pipeManagerType.js';
import { addAdderDataSchema } from './adderManagerSchema.js';
import type { AddAdderData, Adder, AdderManager } from './adderManagerType.js';
import type Z from 'zod';
import { compareZodSchemas } from '../../utils/compareZodSchemas.js';

export class adderManager implements AdderManager {

    private _adder: Adder;
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;
    private _middlewareManager: MiddlewareManager;
    private _crawlerManager: CrawlerManager;
    private _pipeManager: PipeManager;
    private _indexerManager: IndexerManager;


    constructor(addAdderData: AddAdderData, dataManagementKit: DataManagementKit, schemaCheck: SchemaCheck) {

        const result = addAdderDataSchema.safeParse(addAdderData);

        if (!result.success) {
            catchError("adder", ["adder validation error", result.error.message]);
        } else {
            this._adder = result.data as unknown as Adder;
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;

        this._middlewareManager = new middlewareManager(this._adder.middleware, this._dataManagementKit, this._schemaCheck);

        this._crawlerManager = new crawlerManager(this._adder.crawler, this._dataManagementKit);

        this._pipeManager = new pipeManager(this._adder.pipe, this._dataManagementKit, this._schemaCheck);

        this._indexerManager = new indexerManager(this._adder.indexer, this._dataManagementKit);

    }

    async checkSchema() {

        const outputMiddlewareSchema = this._middlewareManager.outputSchema;

        const requestCrawlerSchema = this._crawlerManager.requestSchema;
        const requestPipeSchema = this._pipeManager.requestSchema;
        const requestIndexerSchema = this._indexerManager.requestSchema;

        const requestSchema = requestPipeSchema ? z.object({
            crawler: requestCrawlerSchema,
            pipe: requestPipeSchema,
            indexer: requestIndexerSchema
        }) : z.object({
            crawler: requestCrawlerSchema,
            indexer: requestIndexerSchema
        })

        const outputCrawlerSchema = this._crawlerManager.outputSchema;
        const inputPipeSchema = this._pipeManager.inputSchema;
        const outputPipeSchema = this._pipeManager.outputSchema;
        const inputIndexerSchema = this._indexerManager.inputSchema;

        if (this._schemaCheck == "match") {

            if (outputMiddlewareSchema && outputMiddlewareSchema != requestSchema) {

                catchError("adder", [
                    "adder schema error",
                    `adder ${this._adder.adderManifesto.name} outputMiddlewareSchema is not equal to requestSchema`
                ])

            }

            if (inputPipeSchema && outputPipeSchema) {

                if (outputCrawlerSchema != inputPipeSchema) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (outputPipeSchema != inputIndexerSchema) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (outputCrawlerSchema != inputIndexerSchema) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputIndexerSchema`
                    ])
                }

            }

        }

        if (this._schemaCheck == "include") {

            if (outputMiddlewareSchema && compareZodSchemas(requestSchema, outputMiddlewareSchema)) {

                catchError("adder", [
                    "adder schema error",
                    `adder ${this._adder.adderManifesto.name} outputMiddlewareSchema is not equal to requestSchema`
                ])

            }

            if (inputPipeSchema && outputPipeSchema) {

                if (compareZodSchemas(inputPipeSchema, outputCrawlerSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputCrawlerSchema is not equal to inputPipeSchema`
                    ])
                }

                if (compareZodSchemas(inputIndexerSchema, outputPipeSchema)) {
                    catchError("adder", [
                        "adder schema error",
                        `adder ${this._adder.adderManifesto.name} outputPipeSchema is not equal to inputIndexerSchema`
                    ])
                }

            } else {

                if (compareZodSchemas(inputIndexerSchema, outputCrawlerSchema)) {
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


    async setup() {
        await this.init();
        await this.checkSchema();
        await this.checkDependence();
    }

    async process(input: object) {

    }

}