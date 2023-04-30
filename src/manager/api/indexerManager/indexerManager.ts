import { catchError } from "../../../error/catchError";
import { DataManagementKit } from "../../../indexType";
import { addIndexerDataSchema } from "./indexerManagerSchema";
import { AddIndexerData } from "./indexerManagerType"
import { compareDependenceVersion } from "../../../utils/compareDependenceVersion";
import { version } from "../../../version";

export class IndexerManager {

    private _indexer;
    private _dataManagementKit: DataManagementKit;

    constructor(addIndexerData: AddIndexerData, dataManagementKit: DataManagementKit) {
        const result = addIndexerDataSchema.safeParse(addIndexerData);
        if (!result.success) {
            catchError("indexerValidation", ["indexer validation error", result.error.message]);
            //exit
        } else {
            this._indexer = result.data as unknown as AddIndexerData;
        }

        this._dataManagementKit = dataManagementKit;
    }

    async init() {
        if (this._indexer.init) {
            await this._indexer.init(this._dataManagementKit);
        }
    }

    get requestSchema() {
        return this._indexer.requestSchema;
    }

    get inputSchema() {
        return this._indexer.inputSchema;
    }

    get outputSchema() {
        return this._indexer.outputSchema;
    }

    async checkDependence() {
        const dependence = this._indexer.indexerManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("indexerValidation", [
                    "indexer validation error",
                    `indexer ${this._indexer.indexerManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.init();
        await this.checkDependence();
    }

    async process(requestData: any, inputData: any) {
        const safeRequest = this._indexer.requestSchema.safeParse(requestData);
        const safeInput = this._indexer.inputSchema.safeParse(inputData);
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
            const result = await this._indexer.process(safeRequest.data, safeInput.data, this._dataManagementKit);
            return result;
        }
    }

}