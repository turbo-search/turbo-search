import { ExtensionManager } from "./manager/extensionManager/extensionManager.js";
import {
  AddTaskAndEndpointData,
  DataManagementKit,
  SchemaCheck,
  TurboSearchCore,
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

export class turboSearchCore implements TurboSearchCore {
  public version = version;
  private _schemaCheck: SchemaCheck;
  private _database;
  private _taskManager;
  private _endpointManager;
  private _extensionManager;
  private _memoryStoreManager;
  private _jobManager;
  private _searcherManager;
  private _adderManagerList;

  constructor(options: TurboSearchCoreOptions) {

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

    //setup searcher
    this._searcherManager = new SearcherManager(
      options.searcher,
      this.dataManagementKit(),
      this.turboSearchKit(),
      this._schemaCheck
    );
    this._searcherManager.setup()

    //setup adder
    this._adderManagerList = options.adders.map((adder) => {
      return new AdderManager(
        adder,
        this.dataManagementKit(),
        this.turboSearchKit(),
        this._schemaCheck
      )
    });

    this._adderManagerList.forEach((adderManager) => {
      adderManager.setup()
    })

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

  get endpoint() {
    return this._endpointManager.endpoints;
  }

  turbo(): void {
    console.log("⚡turbo")
  }
}
