import { DataManagementKit, SchemaCheck } from "../../../indexType";
import { Pipe, PipeManager, AddPipeData } from "./pipeManagerType";
import { addPipeDataSchema } from "./pipeManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";
import { compareZodSchemas } from "../../../utils/compareZodSchemas";
import { deepEqualZodSchema } from "../../../utils/deepEqualZodSchema";

export class pipeManager implements PipeManager {

    private _pipeList: Pipe[] = [];
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;

    constructor(_addPipeDataList: AddPipeData[], dataManagementKit: DataManagementKit, schemaCheck: SchemaCheck) {

        const result = addPipeDataSchema.safeParse(_addPipeDataList);
        if (!result.success) {
            catchError("pipeValidation", ["pipe validation error", result.error.message]);
        } else {
            this._pipeList = result.data as unknown as AddPipeData[];
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;
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
                await pipe.init(this._dataManagementKit);
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

    }


    async setup() {
        await this.init();
        await this.checkSchema();
        await this.checkDependence();
    };

    async processAll(requestData: any, inputData: any) {

        let outputData: any = {
            success: true,
            output: inputData
        };

        for (const pipe of this._pipeList) {

            if (outputData.success === false) return;

            const result = await this.process(requestData, outputData, pipe);
            if (result.success) {
                outputData = result.output;
            } else {
                return result;
            }
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
            const result = await pipe.process(safeRequest.data, safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}