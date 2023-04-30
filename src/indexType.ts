import { AddTaskData, Tasks } from "./manager/taskManager/taskManagerType";
import { Extension } from "./manager/extensionManager/extensionManagerType";
import { AddEndpointData, Endpoints } from "./manager/endpointManager/endpointManagerType";
import { JobManager } from "./manager/jobManager/jobManagerType";
import { MemoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManagerType";
import { AddDatabaseData, DatabaseManager } from "./manager/databaseManager/databaseManagerType";
import { Adder } from "./manager/adderManager/adderManagerType";
import { Searcher } from "./manager/searcherManager/searcherManagerType";

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

export type TurboSearchCoreOptions = {
  adders: Adder[];
  searcher: Searcher;
  database: AddDatabaseData;
  extensions: Extension[];
  error?: {
    strictAvailable?: boolean;
  };
  schemaCheck?: SchemaCheck;
};

export type TurboSearchCore = {
  version: string;
  endpoint: Endpoints;

  addTaskAndEndpoint: (
    addTaskAndEndpoint: AddTaskAndEndpointData
  ) => Promise<void>;

};

export type SchemaCheck =
  "match" //スキーマは完全に一致する必要がある if(schema === schema)
  | "include" //スキーマは含まれている必要がある if(schema.includes(schema))
  | false;