import { DataManagementKit } from "../../../indexType";
import { Middleware, MiddlewareManager, addMiddlewareData } from "./middlewareManagerType";
import { addMiddlewareDataSchema } from "./middlewareManagerSchema";
import { catchError } from "../../../error/catchError";

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

}