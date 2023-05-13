import { Task, Tasks } from "@/manager/taskManager/taskManagerType";
import { Extension } from "@/manager/extensionManager/extensionManagerType";
import {
  Endpoint,
  Endpoints,
} from "@/manager/endpointManager/endpointManagerType";
import { Database } from "@/manager/databaseManager/databaseManagerType";
import { Inserter } from "@/manager/inserterManager/inserterManagerType";
import { Searcher } from "@/manager/searcherManager/searcherManagerType";
import { JobManager } from "@/manager/jobManager/jobManager";
import { DatabaseManager } from "@/manager/databaseManager/databaseManager";
import { MemoryStoreManager } from "@/manager/memoryStoreManager/memoryStoreManager";

export type TurboSearchCoreType = {
  inserters?: Inserter[];
  searcher?: Searcher;
  database: Database;
  extensions?: Extension[];
};

export type DefaultTurboSearchCoreType = {
  inserters?: Inserter[];
  searcher?: Searcher;
  database: Database;
  extensions?: Extension[];
};

//拡張機能にturbo-searchへのアクセスを提供するもの
export type TurboSearchKit = {
  addTask: (task: Task) => void;
  addEndpoint: (endpoint: Endpoint) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  jobManager: JobManager;
  extensions: Extension[];
  database: DatabaseManager;
  memoryStore: MemoryStoreManager;
};

export type ExtensionSetupKit = {
  addTask: (task: Task) => void;
  addEndpoint: (endpoint: Endpoint) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  jobManager: JobManager;
  database: DatabaseManager;
  memoryStore: MemoryStoreManager;
};

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => Promise<any | void>;
};

export type TurboSearchCoreOptions<
  T extends TurboSearchCoreType = DefaultTurboSearchCoreType
> = {
  inserters: T["inserters"];
  searcher: T["searcher"];
  database: T["database"];
  extensions: T["extensions"];
  error?: {
    strictAvailable?: boolean;
  };
  schemaCheck?: SchemaCheck;
};

export type SchemaCheck =
  | "match" //スキーマは完全に一致する必要がある if(schema === schema)
  | "include" //スキーマは含まれている必要がある if(schema.includes(schema))
  | false;
