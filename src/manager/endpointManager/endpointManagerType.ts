
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
