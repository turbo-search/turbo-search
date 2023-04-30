import { catchError } from "../../error/catchError";
import { compareDependenceVersion } from "../../utils/compareDependenceVersion";
import { version } from "../../version";
import { addDatabaseDataSchema } from "./databaseManagerSchema";
import { AddDatabaseData, Database } from "./databaseManagerType";

export class DatabaseManager {

    private _databases;

    constructor(addDatabaseData: AddDatabaseData) {
        const result = addDatabaseDataSchema.safeParse(addDatabaseData);
        if (!result.success) {
            catchError("databaseValidation", ["database validation error", result.error.message]);
        } else {
            this._databases = addDatabaseData;
        }
    }

    async init() {
        if (this._databases.init) {
            await this._databases.init();
        }
    }

    async checkDependence() {
        const dependence = this._databases.databaseManifesto.coreDependence;
        if (dependence && dependence != "") {
            if (!compareDependenceVersion(
                version,
                dependence
            )) {
                catchError("crawlerValidation", [
                    "crawler validation error",
                    `crawler ${this._databases.databaseManifesto.name} version is not equal to core version`
                ])
            }
        }
    }

    async setup() {
        await this.checkDependence();
        await this.init();
    }

    async addData(data: any) {
        await this._databases.addData(data);
    }

    async deleteData(data: any) {
        if (this._databases.deleteData) {
            await this._databases.deleteData(data);
        } else {
            catchError("database", [
                "database error",
                `database ${this._databases.databaseManifesto.name} does not support deleteData method`
            ])
        }
    }

    async updateData(data: any) {
        if (this._databases.updateData) {
            await this._databases.updateData(data);
        } else {
            catchError("database", [
                "database error",
                `database ${this._databases.databaseManifesto.name} does not support updateData method`
            ])
        }
    }

    async getAllData() {
        if (this._databases.getAllData) {
            return await this._databases.getAllData();
        } else {
            catchError("database", [
                "database error",
                `database ${this._databases.databaseManifesto.name} does not support getAllData method`
            ])
        }
    }

    async fullTextSearch(query: string) {
        if (this._databases.fullTextSearch) {
            return await this._databases.fullTextSearch(query);
        } else {
            catchError("database", [
                "database error",
                `database ${this._databases.databaseManifesto.name} does not support fullTextSearch method`
            ])
        }
    }

    async vectorSearch(query: string) {
        if (this._databases.vectorSearch) {
            return await this._databases.vectorSearch(query);
        } else {
            catchError("database", [
                "database error",
                `database ${this._databases.databaseManifesto.name} does not support vectorSearch method`
            ])
        }
    }

    get methods() {
        return {
            addData: true,
            deleteData: this._databases.deleteData ? true : false,
            updateData: this._databases.updateData ? true : false,
            getAllData: this._databases.getAllData ? true : false,
            fullTextSearch: this._databases.fullTextSearch ? true : false,
            vectorSearch: this._databases.vectorSearch ? true : false,
        }
    }

}