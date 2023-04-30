import { catchError } from "../../error/catchError";
import { AddEndpointData, Endpoints } from "./endpointManagerType";
import { addEndpointSchema } from "./endpointSchema.js"

export class EndpointManager {

    endpoints: Endpoints;

    constructor() {
        this.endpoints = {};
    }

    // APIなど外部から参照されるような処理を追加する
    async addEndpoint(endpoint: AddEndpointData) {

        if (typeof this.endpoints == "undefined") {
            this.endpoints = {};
        }

        //バリデーションする
        const addEndpointData = addEndpointSchema.safeParse(endpoint);
        if (!addEndpointData.success) {
            catchError("endpointValidation", [
                `Failed to add ${endpoint.name} endpoint`,
                addEndpointData.error.message,
            ]);
        } else {
            if (!this.endpoints[endpoint.provider || "other"]) {
                this.endpoints[endpoint.provider || "other"] = {};
            }
            //すでに存在するか確かめる
            if (!this.endpoints[endpoint.provider || "other"][endpoint.name] || addEndpointData.data.forcedAssignment) {
                this.endpoints[endpoint.provider || "other"][endpoint.name] = addEndpointData.data;
            } else {
                catchError("endpointValidation", [
                    `Failed to add ${endpoint.name} endpoint`,
                    `The endpoint name ${endpoint.name} is already in use`,
                ]);
            }

        }

    }

}