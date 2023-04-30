import { catchError } from "../../../error/catchError";
import { DataManagementKit } from "../../../indexType";
import { addRankerDataSchema } from "./rankerManagerSchema";
import { RankerManager, AddRankerData } from "./rankerManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class rankerManager implements RankerManager {

    private _ranker;
    private _dataManagementKit: DataManagementKit;

    constructor(addRankerData: AddRankerData, dataManagementKit: DataManagementKit) {
        const result = addRankerDataSchema.safeParse(addRankerData);
        if (!result.success) {
            catchError("rankerValidation", ["ranker validation error", result.error.message]);
            //exit
        } else {
            this._ranker = result.data as unknown as AddRankerData;
        }

        this._dataManagementKit = dataManagementKit;
    }

    async init() {
        if (this._ranker.init) {
            await this._ranker.init(this._dataManagementKit);
        }
    }

    get requestSchema() {
        return this._ranker.requestSchema;
    }

    get outputSchema() {
        return this._ranker.outputSchema;
    }

    async checkDependence() {
        const dependence = this._ranker.rankerManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("rankerValidation", [
                    "ranker validation error",
                    `ranker ${this._ranker.rankerManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(requestData: any) {
        const safeRequest = this._ranker.requestSchema.safeParse(requestData);
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
        } else {
            const result = await this._ranker.process(safeRequest.data, this._dataManagementKit);
            return result;
        }
    }

}