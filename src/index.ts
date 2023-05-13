import { ExtensionManager } from "@/manager/extensionManager/extensionManager";
import {
  AddTaskAndEndpointData,
  ExtensionSetupKit,
  SchemaCheck,
  TurboSearchCoreOptions,
  TurboSearchCoreType,
  TurboSearchKit,
} from "@/indexType";
import { version } from "@/version";
import { TaskManager } from "@/manager/taskManager/taskManager";
import { EndpointManager } from "@/manager/endpointManager/endpointManager";
import { MemoryStoreManager } from "@/manager/memoryStoreManager/memoryStoreManager";
import { JobManager } from "@/manager/jobManager/jobManager";
import { DatabaseManager } from "@/manager/databaseManager/databaseManager";
import { SearcherManager } from "@/manager/searcherManager/searcherManager";
import { InserterManager } from "@/manager/inserterManager/inserterManager";
import { catchError } from "@/error/catchError";

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
  private async _addTaskAndEndpoint(taskAndEndpoint: AddTaskAndEndpointData) {
    await this._taskManager.addTask(taskAndEndpoint);
    await this._endpointManager.addEndpoint(taskAndEndpoint);
  }

  turboSearchKit(): TurboSearchKit {
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

  extensionSetupKit(): ExtensionSetupKit {
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

//出力
export * from "@/indexType";
export * from "@/manager/inserterManager/inserterManagerType";
export * from "@/manager/api/crawlerManager/crawlerManagerType";
export * from "@/manager/api/indexerManager/indexerManagerType";
export * from "@/manager/api/interceptorManager/interceptorManagerType";
export * from "@/manager/api/middlewareManager/middlewareManagerType";
export * from "@/manager/api/pipeManager/pipeManagerType";
export * from "@/manager/api/rankerManager/rankerManagerType";
export * from "@/manager/databaseManager/databaseManagerType";
export * from "@/manager/endpointManager/endpointManagerType";
export * from "@/manager/extensionManager/extensionManagerType";
export * from "@/manager/jobManager/jobManagerType";
export * from "@/manager/searcherManager/searcherManagerType";

export type Ran = "middleware" | "ranker" | "pipe" | "interceptor";
