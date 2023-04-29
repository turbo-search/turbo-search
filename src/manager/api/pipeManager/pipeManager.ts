import { DataManagementKit, SchemaCheck } from "../../../indexType";
import { Pipe, PipeManager, addPipeData } from "./pipeManagerType";
import { addPipeDataSchema } from "./pipeManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";
import { compareZodSchemas } from "../../../utils/compareZodSchemas";

export class pipeManager implements PipeManager {

    private _pipeList: Pipe[] = [];
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;

    constructor(_addPipeDataList: addPipeData[], dataManagementKit: DataManagementKit, schemaCheck: SchemaCheck) {

        const result = addPipeDataSchema.safeParse(_addPipeDataList);
        if (!result.success) {
            catchError("pipeValidation", ["pipe validation error", result.error.message]);
        } else {
            this._pipeList = result.data as unknown as addPipeData[];
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;
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

            if (this._schemaCheck == "match" && pipe.outputSchema !== this._pipeList[index + 1].inputSchema) {

                catchError("pipeValidation", [
                    "pipe validation error",
                    `pipe ${pipe.pipeManifesto.name} outputSchema is not equal to pipe ${this._pipeList[index + 1].pipeManifesto.name} inputSchema`
                ])

            }

            // SchemaCheck == include

            if (this._schemaCheck == "include" && compareZodSchemas(pipe.outputSchema, this._pipeList[index + 1].inputSchema)) {

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

    async processAll(inputData: any) {

        let outputData: any = {
            success: true,
            output: inputData
        };

        for (const pipe of this._pipeList) {

            if (outputData.success === false) return;

            const result = await this.process(outputData, pipe);
            if (result.success) {
                outputData = result.output;
            } else {
                return result;
            }
        }

        return outputData;
    }

    async process(inputData: any, pipe: Pipe) {
        const safeInput = pipe.inputSchema.safeParse(inputData);
        if (!safeInput.success) {
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
            const result = await pipe.process(safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}