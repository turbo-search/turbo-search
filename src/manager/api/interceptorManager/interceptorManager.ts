import { catchError } from "../../../error/catchError";
import { DataManagementKit } from "../../../indexType";
import { addInterceptorDataSchema } from "./interceptorManagerSchema";
import { InterceptorManager, AddInterceptorData } from "./interceptorManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class interceptorManager implements InterceptorManager {

    private _interceptor;
    private _dataManagementKit: DataManagementKit;

    constructor(addInterceptorData: AddInterceptorData, dataManagementKit: DataManagementKit) {
        const result = addInterceptorDataSchema.safeParse(addInterceptorData);
        if (!result.success) {
            catchError("interceptorValidation", ["interceptor validation error", result.error.message]);
            //exit
        } else {
            this._interceptor = result.data as unknown as AddInterceptorData;
        }

        this._dataManagementKit = dataManagementKit;
    }

    async init() {
        if (this._interceptor.init) {
            await this._interceptor.init(this._dataManagementKit);
        }
    }

    get requestSchema() {
        return this._interceptor.requestSchema;
    }

    get inputSchema() {
        return this._interceptor.inputSchema;
    }

    get outputSchema() {
        return this._interceptor.outputSchema;
    }

    async checkDependence() {
        const dependence = this._interceptor.interceptorManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("interceptorValidation", [
                    "interceptor validation error",
                    `interceptor ${this._interceptor.interceptorManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(requestData: any, inputData: any) {
        const safeRequest = this._interceptor.requestSchema.safeParse(requestData);
        const safeInput = this._interceptor.inputSchema.safeParse(inputData);
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
            const result = await this._interceptor.process(safeRequest.data, safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}