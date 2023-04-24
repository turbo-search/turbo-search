import { extensionManager } from "./extensionManager/extensionManager.js";
import {
  AddEndpointData,
  AddTaskAndEndpointData,
  AddTaskData,
  Endpoints,
  Extension,
  Tasks,
  TurboSearchCore,
  TurboSearchCoreOptions,
  TurboSearchKit,
} from "./indexType.js";
import { jobs } from "./jobs/jobs.js";
import { version } from "./version.js";

export class turboSearchCore implements TurboSearchCore {
  public version = version;
  public endpoints: Endpoints = {};
  public tasks: Tasks = {};
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

    //setup jobs
    this._job = options.jobs || new jobs();
  }

  // APIなど外部から参照されるような処理を追加する
  async addEndpoint(endpoint: AddEndpointData) {
    const addEndpointData = {
      name: endpoint.name,
      provider: endpoint.provider,
      function: endpoint.function,
    };
    if (!this.endpoints[endpoint.provider || "other"]) {
      this.endpoints[endpoint.provider || "other"] = {};
    }
    this.endpoints[endpoint.provider || "other"][endpoint.name] = addEndpointData;
  }

  //DBなど内部から参照されるような処理を追加する
  async addTask(task: AddTaskData) {
    const addTaskData = {
      name: task.name,
      provider: task.provider,
      function: task.function,
    };
    if (!this.tasks[task.provider || "other"]) {
      this.tasks[task.provider || "other"] = {};
    }
    this.tasks[task.provider || "other"][task.name] = addTaskData;
  }

  // taskとendpoint両方を追加する
  async addTaskAndEndpoint(taskAndEndpoint: AddTaskAndEndpointData) {
    this.addTask({
      name: taskAndEndpoint.name,
      provider: taskAndEndpoint.provider,
      function: taskAndEndpoint.function,
    });
    this.addEndpoint({
      name: taskAndEndpoint.name,
      provider: taskAndEndpoint.provider,
      function: taskAndEndpoint.function,
    });
  }

  turboSearchKit(): TurboSearchKit {
    return {
      addTask: this.addTask,
      addEndpoint: this.addEndpoint,
      addTaskAndEndpoint: this.addTaskAndEndpoint,
      endpoints: this.endpoints,
      tasks: this.tasks,
      job: this._job,
    };
  }
}
