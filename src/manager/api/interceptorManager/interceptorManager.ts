import { DataManagementKit, SchemaCheck } from "../../../indexType";
import { Interceptor, InterceptorManager, addInterceptorData } from "./interceptorManagerType";
import { addInterceptorDataSchema } from "./interceptorManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";
import { compareZodSchemas } from "../../../utils/compareZodSchemas";

export class interceptorManager implements InterceptorManager {

    private _interceptorList: Interceptor[] = [];
    private _dataManagementKit: DataManagementKit;
    private _schemaCheck: SchemaCheck;

    constructor(_addInterceptorDataList: addInterceptorData[], dataManagementKit: DataManagementKit, schemaCheck: SchemaCheck) {

        const result = addInterceptorDataSchema.safeParse(_addInterceptorDataList);
        if (!result.success) {
            catchError("interceptorValidation", ["interceptor validation error", result.error.message]);
        } else {
            this._interceptorList = result.data as unknown as addInterceptorData[];
        }

        this._dataManagementKit = dataManagementKit;

        this._schemaCheck = schemaCheck;
    }

    get inputSchema() {
        if (this._interceptorList.length === 0) return undefined;
        return this._interceptorList[0].inputSchema;
    }

    get outputSchema() {
        if (this._interceptorList.length === 0) return undefined;
        return this._interceptorList[this._interceptorList.length - 1].outputSchema;
    }

    async init() {
        for (const interceptor of this._interceptorList) {
            if (interceptor.init) {
                await interceptor.init(this._dataManagementKit);
            }
        }
    }

    async checkSchema() {

        this._interceptorList.forEach((interceptor, index) => {
            if (index === this._interceptorList.length - 2) {
                return;
            }

            // SchemaCheck == match

            if (this._schemaCheck == "match" && interceptor.outputSchema !== this._interceptorList[index + 1].inputSchema) {

                catchError("interceptorValidation", [
                    "interceptor validation error",
                    `interceptor ${interceptor.interceptorManifesto.name} outputSchema is not equal to interceptor ${this._interceptorList[index + 1].interceptorManifesto.name} inputSchema`
                ])

            }

            // SchemaCheck == include

            if (this._schemaCheck == "include" && compareZodSchemas(interceptor.outputSchema, this._interceptorList[index + 1].inputSchema)) {

                catchError("interceptorValidation", [
                    "interceptor validation error",
                    `interceptor ${interceptor.interceptorManifesto.name} outputSchema is not include interceptor ${this._interceptorList[index + 1].interceptorManifesto.name} inputSchema`
                ])
            }
        });

    }

    async checkDependence() {

        this._interceptorList.forEach((interceptor, index) => {
            const dependence = interceptor.interceptorManifesto.coreDependence;
            if (dependence && dependence != "") {
                if (!compareDependenceVersion(
                    version,
                    dependence
                )) {
                    catchError("interceptorValidation", [
                        "interceptor validation error",
                        `interceptor ${interceptor.interceptorManifesto.name} coreDependence is not equal to core version`
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

        for (const interceptor of this._interceptorList) {

            if (outputData.success === false) return;

            const result = await this.process(outputData, interceptor);
            if (result.success) {
                outputData = result.output;
            } else {
                return result;
            }
        }

        return outputData;
    }

    async process(inputData: any, interceptor: Interceptor) {
        const safeInput = interceptor.inputSchema.safeParse(inputData);
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
            const result = await interceptor.process(safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}