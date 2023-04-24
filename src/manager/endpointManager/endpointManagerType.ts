//エンドポイントを追加するときのデータ
export type AddEndpointData = {
    name: string;
    provider: "core" | string;
    function: () => void;
    forcedAssignment?: boolean;
};

//エンドポイントのデータ
export type Endpoint = {
    name: string;
    provider: "core" | string;
    function: () => void;
};

export type Endpoints = {
    [provider: string]: { [endpointName: string]: Endpoint };
};

export type EndpointManager = {
    addEndpoint: (endpoint: AddEndpointData) => Promise<void>;
    endpoints: Endpoints;
}