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

export type Indexer = {
    name: string,
}

export type Pipe<inputData, outputData> = {
    name: string,
}

export type Adder = {
    name: string,
    description: string,
    crawler: Crawler,
    indexer: Indexer,
    pipes: {
        coreToCrawler: Pipe[],
        crawlerToIndexer: Pipe[],
        indexerToCore: Pipe[],
    }
}

export abstract class Database {

}

export type TurboSearchCoreOptions = {

    adders: Adder[],
    database: Database,
    jobs?: Jobs,
    extensions: Extensions[],
    error: {
        strictAvailable?: boolean
    }
}
export type TurboSearchCore = {
    version: string;
    extensions: Extensions[];
    endpoints: Endpoints;
    tasks: Tasks;

    addEndpoint: (endpoint: AddEndpointData) => Promise<void>,

    addTask: (task: AddTaskData) => Promise<void>,

    addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => Promise<void>,
}