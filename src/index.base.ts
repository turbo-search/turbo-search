import { Jobs } from "./jobs/jobs.base";
import { Job } from "./jobs/jobsDatabase.base";
import { version } from "./version";

//拡張機能にturbo-searchへのアクセスを提供するもの
export type TurboSearchKit = {
    addTask: (task: AddTaskData) => void,
    addEndpoint: (endpoint: AddEndpointData) => void,
    addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void,
    endpoints: Endpoints,
    tasks: Tasks,
    job: Jobs,
}

export type Endpoints = { [queryPath: string]: { [endpointName: string]: Endpoint } }
export type Tasks = { [queryPath: string]: { [endpointName: string]: Task } }

//タスクを追加するときのデータ
export type AddTaskData = {
    name: string,
    extensionManifesto: ExtensionManifesto,
    function: () => void,
}

//タスクのデータ
export type Task = {
    name: string,
    extensionManifesto: ExtensionManifesto,
    function: () => void,
}

//エンドポイントを追加するときのデータ
export type AddEndpointData = {
    name: string,
    extensionManifesto: ExtensionManifesto,
    function: () => void,
}

//エンドポイントのデータ
export type Endpoint = {
    name: string,
    extensionManifesto: ExtensionManifesto,
    function: () => void,
}

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
    name: string,
    extensionManifesto: ExtensionManifesto,
    function: () => void,
}

export type ExtensionManifesto = {
    name: string,
    queryPath?: string,
    dependence?: { [extensionName: string]: string },
    coreDependence?: string,
    version: string,
}

export type Extensions = {
    init?: (turboSearchKit?: TurboSearchKit) => void,
    available?: () => { success: false, message: string } | { success: true },
    manifesto: ExtensionManifesto
};

export type Crawler = {
    name: string,
}

export type Adder = {
    name: string,
    description: string,
    crawler: Crawler,

}

export type TurboSearchCoreOptions = {

    adders: Adder[]
    jobs?: Jobs,
    extensions: Extensions[],
    error: {
        strictAvailable?: boolean
    }
}
export abstract class TurboSearchCore {
    public version = version;
    public extensions: Extensions[] = [];
    public endpoints: Endpoints = {};
    public tasks: Tasks = {};

    addEndpoint(endpoint: AddEndpointData) {
        this._addEndpoint(endpoint);
    }
    abstract _addEndpoint(endpoint: AddEndpointData): void;

    addTask(task: AddTaskData) {
        this._addTask(task);
    }
    abstract _addTask(task: AddTaskData): void;

    addTaskAndEndpoint(addTaskAndEndpoint: AddTaskAndEndpointData) {
        this._addTaskAndEndpoint(addTaskAndEndpoint);
    }
    abstract _addTaskAndEndpoint(addTaskAndEndpoint: AddTaskAndEndpointData): void;
}