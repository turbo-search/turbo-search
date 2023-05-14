import { ExtensionManager } from "@/manager/extensionManager/extensionManager";
import { version } from "@/version";
import { TaskManager } from "@/manager/taskManager/taskManager";
import { EndpointManager } from "@/manager/endpointManager/endpointManager";
import { MemoryStoreManager } from "@/manager/memoryStoreManager/memoryStoreManager";
import { JobManager } from "@/manager/jobManager/jobManager";
import { DatabaseManager } from "@/manager/databaseManager/databaseManager";
import { SearcherManager } from "@/manager/searcherManager/searcherManager";
import { InserterManager } from "@/manager/inserterManager/inserterManager";
import { catchError } from "@/error/catchError";
import { Inserter } from "@/manager/inserterManager/inserterManager";
import { Searcher } from "@/manager/searcherManager/searcherManager";
import { Database } from "@/manager/databaseManager/databaseManager";
import { Extension } from "@/manager/extensionManager/extensionManager";
import { Task, Tasks } from "./manager/taskManager/taskManager";
import { Endpoint, Endpoints } from "@/manager/endpointManager/endpointManager";

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

export class TurboSearchCore<T extends TurboSearchCoreType> {
  public version = version;
  private _schemaCheck: SchemaCheck;
  private _database;
  private _taskManager;
  private _endpointManager;
  private _extensionManager;
  private _memoryStoreManager;
  private _jobManager;
  private _searcherManager: SearcherManager | undefined = undefined;
  private _inserterManagerList: InserterManager[] = [];
  private _options;

  constructor(options: TurboSearchCoreOptions<T>) {
    this._options = options;

    if (options.schemaCheck) {
      this._schemaCheck = options.schemaCheck;
    } else {
      this._schemaCheck = "match";
    }

    //setup database
    this._database = new DatabaseManager(options.database);
    this._database.setup();

    //setup tasks
    this._taskManager = new TaskManager();

    //setup endpoints
    this._endpointManager = new EndpointManager();

    //setup memoryStore
    this._memoryStoreManager = new MemoryStoreManager();

    //setup job
    this._jobManager = new JobManager(this._memoryStoreManager);

    //setup extensions
    this._extensionManager = new ExtensionManager(
      options.extensions ? options.extensions : [],
      options.error ? options.error : {},
      this.extensionSetupKit()
    );
    this._extensionManager.setupExtensions();
  }

  private async _searcherSetup() {
    if (typeof this._options.searcher === "undefined") return;
    //setup searcher
    this._searcherManager = await new SearcherManager(
      this._options.searcher,
      this.turboSearchKit(),
      this._schemaCheck
    );
    await this._searcherManager.setup();
  }

  private async _inserterSetup() {
    //setup inserter

    if (typeof this._options.inserters === "undefined") return;

    for (let i = 0; i < this._options.inserters.length; i++) {
      this._inserterManagerList.push(
        await new InserterManager(
          this._options.inserters[i],
          this.turboSearchKit(),
          this._schemaCheck
        )
      );
    }

    for (let i = 0; i < this._inserterManagerList.length; i++) {
      await this._inserterManagerList[i].setup();
    }
  }

  async setup() {
    await this._searcherSetup();
    await this._inserterSetup();
  }

  // taskとendpoint両方を追加する
  private async _addTaskAndEndpoint(taskAndEndpoint: {
    name: string;
    provider: "core" | string;
    function: () => Promise<any | void>;
  }) {
    await this._taskManager.addTask(taskAndEndpoint);
    await this._endpointManager.addEndpoint(taskAndEndpoint);
  }

  turboSearchKit() {
    return {
      addTask: this._taskManager.addTask,
      addEndpoint: this._endpointManager.addEndpoint,
      addTaskAndEndpoint: this._addTaskAndEndpoint,
      endpoints: this._endpointManager.endpoints,
      tasks: this._taskManager.tasks,
      jobManager: this._jobManager,
      extensions: this._extensionManager.getExtensions(),
      database: this._database,
      memoryStore: this._memoryStoreManager,
    };
  }

  extensionSetupKit() {
    return {
      addTask: this._taskManager.addTask,
      addEndpoint: this._endpointManager.addEndpoint,
      addTaskAndEndpoint: this._addTaskAndEndpoint,
      endpoints: this._endpointManager.endpoints,
      tasks: this._taskManager.tasks,
      jobManager: this._jobManager,
      database: this._database,
      memoryStore: this._memoryStoreManager,
    };
  }

  getEndpoints() {
    return this._endpointManager.endpoints;
  }

  async processEndpoint(
    provider: string,
    endpointName: string,
    data: any,
    options?: any
  ) {
    if (
      this._endpointManager.endpoints &&
      this._endpointManager.endpoints[provider] &&
      this._endpointManager.endpoints[provider][endpointName]
    ) {
      return await this._endpointManager.endpoints[provider][
        endpointName
      ].function(data, options);
    } else {
      catchError("endpoint", [
        "endpoint not found",
        "provider : " + provider,
        "endpointName : " + endpointName,
      ]);
    }
  }

  turbo(): void {
    console.log("⚡turbo");
  }

  async insert(endpointName: string, data: any) {
    return await this.processEndpoint("core", "inserter/" + endpointName, data);
  }

  async search(data: any) {
    return await this.processEndpoint("core", "searcher", data);
  }
}

// //出力
// export * from "@/manager/inserterManager/inserterManager";
// export * from "@/manager/api/crawlerManager/crawlerManager";
// export * from "@/manager/api/indexerManager/indexerManager";
// export * from "@/manager/api/interceptorManager/interceptorManager";
// export * from "@/manager/api/middlewareManager/middlewareManager";
// export * from "@/manager/api/pipeManager/pipeManager";
// export * from "@/manager/api/rankerManager/rankerManager";
// export * from "@/manager/databaseManager/databaseManager";
// export * from "@/manager/endpointManager/endpointManager";
// export * from "@/manager/extensionManager/extensionManager";
// export * from "@/manager/jobManager/jobManager";
// export * from "@/manager/searcherManager/searcherManager";

// export type Ran = "middleware" | "ranker" | "pipe" | "interceptor";
