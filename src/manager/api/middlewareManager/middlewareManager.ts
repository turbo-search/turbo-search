import { DataManagementKit } from "../../../indexType";
import { Middleware, AddMiddlewareData } from "./middlewareManagerType";
import { addMiddlewareDataSchema } from "./middlewareManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class MiddlewareManager {

    private _middlewareList: Middleware[] = [];
    private _dataManagementKit: DataManagementKit;


    constructor(addMiddlewareDataList: AddMiddlewareData[], dataManagementKit: DataManagementKit) {

        const result = addMiddlewareDataSchema.safeParse(addMiddlewareDataList);
        if (!result.success) {
            catchError("middlewareValidation", ["middleware validation error", result.error.message]);
        } else {
            this._middlewareList = addMiddlewareDataList;
        }

        this._dataManagementKit = dataManagementKit;

    }

    async init() {
        for (const middleware of this._middlewareList) {
            if (middleware.init) {
                await middleware.init(this._dataManagementKit);
            }
        }
    }

    async checkDependence() {

        this._middlewareList.forEach((middleware, index) => {
            const dependence = middleware.middlewareManifesto.coreDependence;
            if (dependence && dependence != "") {
                if (!compareDependenceVersion(
                    version,
                    dependence
                )) {
                    catchError("middlewareValidation", [
                        "middleware validation error",
                        `middleware ${middleware.middlewareManifesto.name} coreDependence is not equal to core version`
                    ])
                }
            }
        });

    }


    async setup() {
        await this.init();
        await this.checkDependence();
    };

    async processAll(inputData: any) {

        let outputData: any = {
            success: true,
            output: inputData
        };

        for (const middleware of this._middlewareList) {

            if (outputData.success === false) return;

            const result = await this.process(outputData, middleware);
            if (result.success) {
                outputData = result.output;
            } else {
                return result;
            }
        }

        return outputData;
    }

    async process(inputData: any, middleware: Middleware) {
        const result = await middleware.process(inputData, this._dataManagementKit);
        return result;
    }

}