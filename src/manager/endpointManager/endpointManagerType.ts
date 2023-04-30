//エンドポイントを追加するときのデータ
export type AddEndpointData = {
    name: string;
    provider: "core" | string;
    function: (request: any, option?: any) => any | void;
    forcedAssignment?: boolean; //強制的に割り当てるかどうか
};

//エンドポイントのデータ
export type Endpoint = {
    name: string;
    provider: "core" | string;
    function: (request: any, option?: any) => any | void;
};

export type Endpoints = {
    [provider: string]: { [endpointName: string]: Endpoint };
};
