import { Jobs } from "./jobs/jobs.base";
import { z } from "zod";
import type Z from "zod";

//拡張機能にturbo-searchへのアクセスを提供するもの
export type TurboSearchKit = {
  addTask: (task: AddTaskData) => void;
  addEndpoint: (endpoint: AddEndpointData) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  job: Jobs;
};

export type Endpoints = {
  [provider: string]: { [endpointName: string]: Endpoint };
};
export type Tasks = { [provider: string]: { [taskName: string]: Task } };

//タスクを追加するときのデータ
export type AddTaskData = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

//タスクのデータ
export type Task = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

//エンドポイントを追加するときのデータ
export type AddEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

//エンドポイントのデータ
export type Endpoint = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

export type ExtensionManifesto = {
  name: string;
  dependence?: { [extensionName: string]: string };
  coreDependence?: string;
  version: string;
};

export type Extension = {
  init?: (turboSearchKit?: TurboSearchKit) => void;
  available?: () => { success: false; message: string } | { success: true };
  manifesto: ExtensionManifesto;
};

export type Crawler = {
  name: string;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  process: (
    inputData: Z.infer<Pipe["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | { success: false; message: string; error: any }
    | { success: true; output: Z.infer<Crawler["outputSchema"]> }
  >;
};

export type Indexer = {
  name: string;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  process: (
    inputData: Z.infer<Pipe["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | { success: false; message: string; error: any }
    | { success: true; output: Z.infer<Indexer["outputSchema"]> }
  >;
};

export type Pipe = {
  name: string;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  process: (
    inputData: Z.infer<Pipe["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | { success: false; message: string; error: any }
    | { success: true; output: Z.infer<Pipe["outputSchema"]> }
  >;
};

export type Adder = {
  name: string;
  description: string;
  crawler: Crawler;
  indexer: Indexer;
  pipes: {
    coreToCrawler: Pipe[];
    crawlerToIndexer: Pipe[];
    indexerToCore: Pipe[];
  };
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
};

export type Database = {};

export type TurboSearchCoreOptions = {
  adders: Adder[];
  database: Database;
  jobs?: Jobs;
  extensions: Extension[];
  error: {
    strictAvailable?: boolean;
  };
};

export type TurboSearchCore = {
  version: string;
  endpoints: Endpoints;
  tasks: Tasks;

  addEndpoint: (endpoint: AddEndpointData) => Promise<void>;

  addTask: (task: AddTaskData) => Promise<void>;

  addTaskAndEndpoint: (
    addTaskAndEndpoint: AddTaskAndEndpointData
  ) => Promise<void>;
};
