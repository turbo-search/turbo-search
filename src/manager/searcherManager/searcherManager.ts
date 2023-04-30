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

        this._middlewareManager = new MiddlewareManager(this._searcher.middleware, this._dataManagementKit);

        this._rankerManager = new RankerManager(this._searcher.ranker, this._dataManagementKit);

        this._pipeManager = new PipeManager(this._searcher.pipe, this._dataManagementKit, this._schemaCheck);

        this._interceptorManager = new InterceptorManager(this._searcher.interceptor, this._dataManagementKit);

        this._turboSearchKit = turboSearchKit;

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

            const rankerResult = await this._rankerManager.process(middlewareResult.output);

            if (rankerResult.success) {

                const pipeResult = await this._pipeManager.processAll(middlewareResult.output, rankerResult.output);

                if (pipeResult.success) {

                    const interceptorResult = await this._interceptorManager.process(middlewareResult.output, pipeResult.output);

                    if (interceptorResult.success) {
                        return { ...interceptorResult, ran: ["middleware", "ranker", "pipe", "interceptor"] as Ran[] };
                    } else {
                        return { ...pipeResult, ran: ["middleware", "ranker", "pipe"] as Ran[] };
                    }

                } else {
                    return { ...pipeResult, ran: ["middleware", "ranker"] as Ran[] };
                }

            } else {
                return { ...rankerResult, ran: ["middleware"] as Ran[] };
            }

        } else {
            return { ...middlewareResult, ran: [] as Ran[] };
        }

    }

}