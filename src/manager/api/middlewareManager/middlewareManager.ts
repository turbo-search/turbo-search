import { DataManagementKit } from "../../../indexType";
import { Middleware, MiddlewareManager, addMiddlewareData } from "./middlewareManagerType";
import { addMiddlewareDataSchema } from "./middlewareManagerSchema";
import { catchError } from "../../../error/catchError";
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class middlewareManager implements MiddlewareManager {

    private _middlewareList: Middleware[] = [];
    private _dataManagementKit: DataManagementKit;

    constructor(_addMiddlewareDataList: addMiddlewareData[], dataManagementKit: DataManagementKit) {

        const result = addMiddlewareDataSchema.safeParse(_addMiddlewareDataList);
        if (!result.success) {
            catchError("middlewareValidation", ["middleware validation error", result.error.message]);
        } else {
            this._middlewareList = result.data as unknown as addMiddlewareData[];
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

    async checkSchema() {

        this._middlewareList.forEach((middleware, index) => {
            if (index === this._middlewareList.length - 2) {
                return;
            }
            if (middleware.outputSchema !== this._middlewareList[index + 1].inputSchema) {

                catchError("middlewareValidation", [
                    "middleware validation error",
                    `middleware ${middleware.middlewareManifesto.name} outputSchema is not equal to middleware ${this._middlewareList[index + 1].middlewareManifesto.name} inputSchema`
                ])

            }
        });

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
        await this.checkSchema();
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
        const safeInput = middleware.inputSchema.safeParse(inputData);
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
            const result = await middleware.process(safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}