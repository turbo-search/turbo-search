import { catchError } from "../../error/catchError";
import { AddEndpointData, Endpoints } from "./endpointManagerType";
import { addEndpointSchema } from "./endpointSchema.js"

export class EndpointManager {

    private _endpoints: Endpoints = {};

    // APIなど外部から参照されるような処理を追加する
    async addEndpoint(endpoint: AddEndpointData) {

        //バリデーションする
        const addEndpointData = addEndpointSchema.safeParse(endpoint);
        if (!addEndpointData.success) {
            catchError("endpointValidation", [
                `Failed to add ${endpoint.name} endpoint`,
                addEndpointData.error.message,
            ]);
        } else {
            console.log(this._endpoints)
            if (!this._endpoints[endpoint.provider || "other"]) {
                this._endpoints[endpoint.provider || "other"] = {};
            }
            //すでに存在するか確かめる
            if (!this._endpoints[endpoint.provider || "other"][endpoint.name] || addEndpointData.data.forcedAssignment) {
                this._endpoints[endpoint.provider || "other"][endpoint.name] = addEndpointData.data;
            } else {
                catchError("endpointValidation", [
                    `Failed to add ${endpoint.name} endpoint`,
                    `The endpoint name ${endpoint.name} is already in use`,
                ]);
            }
        }
    }

    get endpoints() {
        return this._endpoints;
    }
}