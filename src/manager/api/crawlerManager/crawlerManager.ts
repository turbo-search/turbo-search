import { catchError } from "../../../error/catchError";
import { DataManagementKit } from "../../../indexType";
import { addCrawlerDataSchema } from "./crawlerManagerSchema";
import { CrawlerManager, AddCrawlerData } from "./crawlerManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class crawlerManager implements CrawlerManager {

    private _crawler;
    private _dataManagementKit: DataManagementKit;

    constructor(addCrawlerData: AddCrawlerData, dataManagementKit: DataManagementKit) {
        const result = addCrawlerDataSchema.safeParse(addCrawlerData);
        if (!result.success) {
            catchError("crawlerValidation", ["crawler validation error", result.error.message]);
            //exit
        } else {
            this._crawler = result.data as unknown as AddCrawlerData;
        }

        this._dataManagementKit = dataManagementKit;
    }

    async init() {
        if (this._crawler!.init) {
            await this._crawler!.init(this._dataManagementKit);
        }
    }

    get inputSchema() {
        return this._crawler!.inputSchema;
    }

    get outputSchema() {
        return this._crawler!.outputSchema;
    }

    async checkDependence() {
        const dependence = this._crawler!.crawlerManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("crawlerValidation", [
                    "crawler validation error",
                    `crawler ${this._crawler!.crawlerManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(inputData: any) {
        const safeInput = this._crawler!.inputSchema.safeParse(inputData);
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
            const result = await this._crawler!.process(safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}