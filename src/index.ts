import { ExtensionManager } from "./manager/extensionManager/extensionManager.js";
import {
  AddTaskAndEndpointData,
  DataManagementKit,
  SchemaCheck,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "./indexType.js";
import { version } from "./version.js";
import { TaskManager } from "./manager/taskManager/taskManager.js";
import { EndpointManager } from "./manager/endpointManager/endpointManager.js";
import { MemoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManager.js";
import { JobManager } from "./manager/jobManager/jobManager.js";
import { DatabaseManager } from "./manager/databaseManager/databaseManager.js";
import { SearcherManager } from "./manager/searcherManager/searcherManager.js";
import { AdderManager } from "./manager/adderManager/adderManager.js";

export class TurboSearchCore {
  public version = version;
  private _schemaCheck: SchemaCheck;
  private _database;
  private _taskManager;
  private _endpointManager;
  private _extensionManager;
  private _memoryStoreManager;
  private _jobManager;
  private _searcherManager: SearcherManager | undefined = undefined;
  private _adderManagerList: AdderManager[] = [];
  private _options;

  constructor(options: TurboSearchCoreOptions) {

    this._options = options;

    if (options.schemaCheck) {
      this._schemaCheck = options.schemaCheck;
    } else {
      this._schemaCheck = "match";
    }

    //setup database
    this._database = new DatabaseManager(options.database);

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
      options.extensions,
      options.error ? options.error : {},
      this.version,
      this.turboSearchKit()
    );
    this._extensionManager.setupExtensions();

  }

  async searcherSetup() {

    if (typeof this._options.searcher === "undefined") return
    //setup searcher
    this._searcherManager = await new SearcherManager(
      this._options.searcher,
      this.dataManagementKit(),
      this.turboSearchKit(),
      this._schemaCheck
    );
    await this._searcherManager.setup()
  }

  async adderSetup() {
    //setup adder

    for (let i = 0; i < this._options.adders.length; i++) {
      this._adderManagerList.push(
        await new AdderManager(
          this._options.adders[i],
          this.dataManagementKit(),
          this.turboSearchKit(),
          this._schemaCheck
        )
      )
    }

    for (let i = 0; i < this._adderManagerList.length; i++) {
      await this._adderManagerList[i].setup()
    }

  }

  async setup() {

    await this.searcherSetup()
    await this.adderSetup()

  }

  // taskとendpoint両方を追加する
  async addTaskAndEndpoint(taskAndEndpoint: AddTaskAndEndpointData) {
    await this._taskManager.addTask(taskAndEndpoint);
    await this._endpointManager.addEndpoint(taskAndEndpoint);
  }



  turboSearchKit(): TurboSearchKit {
    return {
      addTask: this._taskManager.addTask,
      addEndpoint: this._endpointManager.addEndpoint,
      addTaskAndEndpoint: this.addTaskAndEndpoint,
      endpoints: this._endpointManager.endpoints,
      tasks: this._taskManager.tasks,
      jobManager: this._jobManager,
    };
  }

  dataManagementKit(): DataManagementKit {
    return {
      database: this._database,
      memoryStore: this._memoryStoreManager,
    };
  }

  getEndpoints() {
    return this._endpointManager.endpoints;
  }

  turbo(): void {
    console.log("⚡turbo")
  }
}
