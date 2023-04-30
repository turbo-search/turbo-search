import { catchError } from "../../../error/catchError";
import { DataManagementKit } from "../../../indexType";
import { addRankingDataSchema } from "./rankingManagerSchema";
import { RankingManager, AddRankingData } from "./rankingManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class rankingManager implements RankingManager {

    private _ranking;
    private _dataManagementKit: DataManagementKit;

    constructor(addRankingData: AddRankingData, dataManagementKit: DataManagementKit) {
        const result = addRankingDataSchema.safeParse(addRankingData);
        if (!result.success) {
            catchError("rankingValidation", ["ranking validation error", result.error.message]);
            //exit
        } else {
            this._ranking = result.data as unknown as AddRankingData;
        }

        this._dataManagementKit = dataManagementKit;
    }

    async init() {
        if (this._ranking.init) {
            await this._ranking.init(this._dataManagementKit);
        }
    }

    get requestSchema() {
        return this._ranking.requestSchema;
    }

    get outputSchema() {
        return this._ranking.outputSchema;
    }

    async checkDependence() {
        const dependence = this._ranking.rankingManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("rankingValidation", [
                    "ranking validation error",
                    `ranking ${this._ranking.rankingManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(requestData: any) {
        const safeRequest = this._ranking.requestSchema.safeParse(requestData);
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
            const result = await this._ranking.process(safeRequest.data, this._dataManagementKit);
            return result;
        }
    }

}