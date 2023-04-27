import { extensionManager } from "./manager/extensionManager/extensionManager.js";
import {
  AddTaskAndEndpointData,
  TurboSearchCore,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "./indexType.js";
import { version } from "./version.js";
import { taskManager } from "./manager/taskManager/taskManager.js";
import { endpointManager } from "./manager/endpointManager/endpointManager.js";
import { memoryStoreManager } from "./manager/memoryStoreManager/memoryStoreManager.js";
import { jobManager } from "./manager/jobManager/jobManager.js";

export class turboSearchCore implements TurboSearchCore {
  public version = version;
  private _taskManager;
  private _endpointManager;
  private _extensionManager;
  private _memoryStoreManager;
  private _jobManager;

  constructor(options: TurboSearchCoreOptions) {
    //setup extensions
    this._extensionManager = new extensionManager(
      options.extensions,
      options.error,
      this.version,
      this.turboSearchKit()
    );
    this._extensionManager.setupExtensions();

    //setup tasks
    this._taskManager = new taskManager();

    //setup endpoints
    this._endpointManager = new endpointManager();

    //setup memoryStore
    this._memoryStoreManager = new memoryStoreManager();

    //setup job
    this._jobManager = new jobManager(this._memoryStoreManager);
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
}
