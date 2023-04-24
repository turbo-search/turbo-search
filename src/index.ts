import { extensionManager } from "./manager/extensionManager/extensionManager.js";
import {
  AddTaskAndEndpointData,
  TurboSearchCore,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "./indexType.js";
import { jobs } from "./jobs/jobs.js";
import { version } from "./version.js";
import { taskManager } from "./manager/taskManager/taskManager.js";
import { endpointManager } from "./manager/endpointManager/endpointManager.js";

export class turboSearchCore implements TurboSearchCore {
  public version = version;
  private _taskManager;
  private _endpointManager;
  private _job;
  private _extensionManager;

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

    //setup jobs
    this._job = options.jobs || new jobs();
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
      job: this._job,
    };
  }
}
