import { catchError } from "@/error/catchError";
import { endpointSchema } from "./endpointSchema";


//エンドポイントのデータ
export type Endpoint = {
  name: string;
  provider: "core" | string;
  function: (request: any, option?: any) => Promise<any | void>;
  forcedAssignment?: boolean; //強制的に割り当てるかどうか
};

export type Endpoints = {
  [provider: string]: { [endpointName: string]: Endpoint };
};


export class EndpointManager {
  endpoints: Endpoints;

  constructor() {
    this.endpoints = {};
  }

  // APIなど外部から参照されるような処理を追加する
  async addEndpoint(addEndpointData: Endpoint) {
    if (typeof this.endpoints == "undefined") {
      this.endpoints = {};
    }

    //バリデーションする
    const result = endpointSchema.safeParse(addEndpointData);
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
      if (
        !this.endpoints[addEndpointData.provider || "other"][
        addEndpointData.name
        ] ||
        addEndpointData.forcedAssignment
      ) {
        this.endpoints[addEndpointData.provider || "other"][
          addEndpointData.name
        ] = addEndpointData;
      } else {
        catchError("endpointValidation", [
          `Failed to add ${addEndpointData.name} endpoint`,
          `The endpoint name ${addEndpointData.name} is already in use`,
        ]);
      }
    }
  }
}
