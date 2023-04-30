import { extensionManager } from "./manager/extensionManager/extensionManager.js";
import {
  AddTaskAndEndpointData,
  DataManagementKit,
  SchemaCheck,
  TurboSearchCore,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "./indexType.js";
import { version } from "./version.js";
import { taskManager } from "./manager/taskManager/taskManager.js";
import { endpointManager } from "./manager/endpointManager/endpointManager.js";
import { memoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManager.js";
import { jobManager } from "./manager/jobManager/jobManager.js";
import { databaseManager } from "./manager/databaseManager/databaseManager.js";
import { searcherManager } from "./manager/searcherManager/searcherManager.js";
import { adderManager } from "./manager/adderManager/adderManager.js";

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
    this._database = new databaseManager(options.database);

    //setup tasks
    this._taskManager = new taskManager();

    //setup endpoints
    this._endpointManager = new endpointManager();

    //setup memoryStore
    this._memoryStoreManager = new memoryStoreManager();

    //setup job
    this._jobManager = new jobManager(this._memoryStoreManager);

    //setup extensions
    this._extensionManager = new extensionManager(
      options.extensions,
      options.error ? options.error : {},
      this.version,
      this.turboSearchKit()
    );
    this._extensionManager.setupExtensions();

    //setup searcher
    this._searcherManager = new searcherManager(
      options.searcher,
      this.dataManagementKit(),
      this.turboSearchKit(),
      this._schemaCheck
    );

    //setup adder
    this._adderManagerList = options.adders.map((adder) => {
      return new adderManager(
        adder,
        this.dataManagementKit(),
        this.turboSearchKit(),
        this._schemaCheck
      )
    });
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
}
