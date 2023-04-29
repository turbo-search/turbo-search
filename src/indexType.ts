import type Z from "zod";
import { AddTaskData, Tasks } from "./manager/taskManager/taskManagerType";
import { Extension } from "./manager/extensionManager/extensionManagerType";
import { AddEndpointData, Endpoints } from "./manager/endpointManager/endpointManagerType";
import { JobManager } from "./manager/jobManager/jobManagerType";
import { MemoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManagerType";
import { Pipe } from "./manager/api/pipeManager/pipeManagerType";
import { AddDatabaseData, DatabaseManager } from "./manager/databaseManager/databaseManagerType";
import { Crawler } from "./manager/api/crawlerManager/crawlerManagerType";
import { Indexer } from "./manager/api/indexerManager/indexerManagerType";

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
  database: DatabaseManager,
  memoryStore: MemoryStoreManager
};

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => void;
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


export type TurboSearchCoreOptions = {
  adders: Adder[];
  database: AddDatabaseData;
  extensions: Extension[];
  error?: {
    strictAvailable?: boolean;
  };
  schemaCheck?: SchemaCheck;
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