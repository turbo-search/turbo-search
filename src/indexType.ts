import { z } from "zod";
import type Z from "zod";
import { AddTaskData, Tasks } from "./manager/taskManager/taskManagerType";
import { Extension } from "./manager/extensionManager/extensionManagerType";
import { AddEndpointData, Endpoints } from "./manager/endpointManager/endpointManagerType";
import { Job, JobManager } from "./manager/jobManager/jobManagerType";
import { MemoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManagerType";
import { Pipe } from "./manager/api/pipeManager/pipeManagerType";

//拡張機能にturbo-searchへのアクセスを提供するもの
export type TurboSearchKit = {
  addTask: (task: AddTaskData) => void;
  addEndpoint: (endpoint: AddEndpointData) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  jobManager: JobManager;
};

//Databaseへのアクセスを提供するもの
export type DataManagementKit = {
  database: {

  },
  memoryStore: MemoryStoreManager
};

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => void;
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
  extensions: Extension[];
  error?: {
    strictAvailable?: boolean;
  };
  schemaCheck?: {
    crawler?: SchemaCheck;
    indexer?: SchemaCheck;
    pipe?: SchemaCheck;
  } | SchemaCheck;
};

export type TurboSearchCore = {
  version: string;

  addTaskAndEndpoint: (
    addTaskAndEndpoint: AddTaskAndEndpointData
  ) => Promise<void>;
};

export type SchemaCheck =
  "match" //スキーマは完全に一致する必要がある if(schema === schema)
  | "include" //スキーマは含まれている必要がある if(schema.includes(schema))
  | false;