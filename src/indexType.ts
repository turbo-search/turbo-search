import { AddTaskData, Tasks } from "./manager/taskManager/taskManagerType";
import { Extension } from "./manager/extensionManager/extensionManagerType";
import { AddEndpointData, Endpoints } from "./manager/endpointManager/endpointManagerType";
import { AddDatabaseData } from "./manager/databaseManager/databaseManagerType";
import { AddInserterData } from "./manager/inserterManager/inserterManagerType";
import { AddSearcherData } from "./manager/searcherManager/searcherManagerType";
import { JobManager } from "./manager/jobManager/jobManager";
import { DatabaseManager } from "./manager/databaseManager/databaseManager";
import { MemoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManager";

//拡張機能にturbo-searchへのアクセスを提供するもの
export type TurboSearchKit = {
  addTask: (task: AddTaskData) => void;
  addEndpoint: (endpoint: AddEndpointData) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  jobManager: JobManager;
  extensions: Extension[];
  database: DatabaseManager;
  memoryStore: MemoryStoreManager;
};

export type ExtensionSetupKit = {
  addTask: (task: AddTaskData) => void;
  addEndpoint: (endpoint: AddEndpointData) => void;
  addTaskAndEndpoint: (addTaskAndEndpoint: AddTaskAndEndpointData) => void;
  endpoints: Endpoints;
  tasks: Tasks;
  jobManager: JobManager;
  database: DatabaseManager,
  memoryStore: MemoryStoreManager,
}

//Databaseへのアクセスを提供するもの
export type DataManagementKit = {
  database: DatabaseManager,
  memoryStore: MemoryStoreManager,
  endpoints: Endpoints;
  tasks: Tasks;
};

//タスクとエンドポイントを追加するときのデータ
export type AddTaskAndEndpointData = {
  name: string;
  provider: "core" | string;
  function: () => void;
};

export type TurboSearchCoreOptions = {
  inserters?: AddInserterData[];
  searcher?: AddSearcherData;
  database: AddDatabaseData;
  extensions?: Extension[];
  error?: {
    strictAvailable?: boolean;
  };
  schemaCheck?: SchemaCheck;
};

export type SchemaCheck =
  "match" //スキーマは完全に一致する必要がある if(schema === schema)
  | "include" //スキーマは含まれている必要がある if(schema.includes(schema))
  | false;