import { catchError } from "../../error/catchError";
import { AddEndpointData, Endpoints } from "./endpointManagerType";
import { addEndpointSchema } from "./endpointSchema.js"

export class EndpointManager {

    endpoints: Endpoints;

    constructor() {
        this.endpoints = {};
    }

    // APIなど外部から参照されるような処理を追加する
    async addEndpoint(addEndpointData: AddEndpointData) {

        if (typeof this.endpoints == "undefined") {
            this.endpoints = {};
        }

        //バリデーションする
        const result = addEndpointSchema.safeParse(addEndpointData);
        if (!result.success) {
            catchError("endpointValidation", [
                `Failed to add ${addEndpointData.name} endpoint`,
                result.error.message,
            ]);
        } else {
            if (!this.endpoints[addEndpointData.provider || "other"]) {
                this.endpoints[addEndpointData.provider || "other"] = {};
            }
            //すでに存在するか確かめる
            if (!this.endpoints[addEndpointData.provider || "other"][addEndpointData.name] || addEndpointData.forcedAssignment) {
                this.endpoints[addEndpointData.provider || "other"][addEndpointData.name] = addEndpointData;
            } else {
                catchError("endpointValidation", [
                    `Failed to add ${addEndpointData.name} endpoint`,
                    `The endpoint name ${addEndpointData.name} is already in use`,
                ]);
            }

        }

    }

}