import { extensionManager } from "./extensionManager/extensionManager.js";
import { AddEndpointData, AddTaskAndEndpointData, AddTaskData, Endpoints, Extension, Tasks, TurboSearchCore, TurboSearchCoreOptions, TurboSearchKit } from "./indexType.js";
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
        this._extensionManager = new extensionManager(options.extensions, options.error, this.version, this.turboSearchKit());

        //setup jobs
        this._job = options.jobs || new jobs();
    }

    // APIなど外部から参照されるような処理を追加する
    async addEndpoint(endpoint: AddEndpointData) {
        const addEndpointData = {
            name: endpoint.name,
            extensionManifesto: endpoint.extensionManifesto,
            function: endpoint.function
        }
        if (endpoint.extensionManifesto.queryPath) {
            if (!this.endpoints[endpoint.extensionManifesto.queryPath]) {
                this.endpoints[endpoint.extensionManifesto.queryPath] = {};
            }
            this.endpoints[endpoint.extensionManifesto.queryPath][endpoint.name] = addEndpointData;
        } else {
            if (!this.endpoints[endpoint.extensionManifesto.name]) {
                this.endpoints[endpoint.extensionManifesto.name] = {};
            }
            this.endpoints[endpoint.extensionManifesto.name][endpoint.name] = addEndpointData;
        }
    }

    //DBなど内部から参照されるような処理を追加する
    async addTask(task: AddTaskData) {
        const addTaskData = {
            name: task.name,
            extensionManifesto: task.extensionManifesto,
            function: task.function
        }
        if (task.extensionManifesto.queryPath) {
            if (!this.tasks[task.extensionManifesto.queryPath]) {
                this.tasks[task.extensionManifesto.queryPath] = {};
            }
            this.tasks[task.extensionManifesto.queryPath][task.name] = addTaskData;
        } else {
            if (!this.tasks[task.extensionManifesto.name]) {
                this.tasks[task.extensionManifesto.name] = {};
            }
            this.tasks[task.extensionManifesto.name][task.name] = addTaskData;
        }
    }

    // taskとendpoint両方を追加する
    async addTaskAndEndpoint(taskAndEndpoint: AddTaskAndEndpointData) {
        this.addTask({
            name: taskAndEndpoint.name,
            extensionManifesto: taskAndEndpoint.extensionManifesto,
            function: taskAndEndpoint.function
        });
        this.addEndpoint({
            name: taskAndEndpoint.name,
            extensionManifesto: taskAndEndpoint.extensionManifesto,
            function: taskAndEndpoint.function
        });
    }

    turboSearchKit(): TurboSearchKit {
        return {
            addTask: this.addTask,
            addEndpoint: this.addEndpoint,
            addTaskAndEndpoint: this.addTaskAndEndpoint,
            endpoints: this.endpoints,
            tasks: this.tasks,
            job: this._job
        }
    }

}