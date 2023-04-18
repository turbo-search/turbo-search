import { catchError } from "./error/catchError.js";
import type { Extensions, TurboSearchCoreOptions, Endpoint, AddEndpointData, AddTaskData, Task, TurboSearchKit, Endpoints, Tasks, AddTaskAndEndpointData } from "./index.d.js";
import { compareDependenceVersion } from "./utils/compareDependenceVersion.js";
import { version } from "./version.js";

export class turboSearchCore {

    public version = version;
    public extensions: Extensions[] = [];
    public endpoints: Endpoints = {};
    public tasks: Tasks = {};

    constructor(options: TurboSearchCoreOptions) {
        this.extensions = options.extensions;

        //check extensions manifesto
        this.extensions.forEach((extension, index) => {
            if (!extension.manifesto || !extension.manifesto.name) {
                catchError("manifesto", ["extension manifesto error", "extension index is " + index])
            }
        });

        //extensions available check
        this.extensions.map((extension) => {
            if (typeof extension.available !== "function") {
                return true;
            } else {
                const extensionAvailable = extension.available();
                if (extensionAvailable.success) {
                    return true
                } else {
                    if (typeof options.error == "object" && "boolean" && options.error.strictAvailable) {
                        catchError("available", [extension.manifesto.name + " is not available"])
                    } else {
                        //TODO:Error Log
                    }
                }
            }
        });

        //dependencies check
        this.extensions.forEach((extension) => {

            if (extension.manifesto.coreDependence) {
                if (extension.manifesto.coreDependence === "" || !compareDependenceVersion(this.version, extension.manifesto.coreDependence)) {
                    catchError("dependence", [extension.manifesto.name + " coreDependence is not match"])
                }
            }

            if (extension.manifesto.dependence) {
                Object.keys(extension.manifesto.dependence).forEach((dependenceExtensionName) => {
                    const dependenceExtension = this.extensions.find((extension) => extension.manifesto.name === dependenceExtensionName);
                    if (!dependenceExtension) {
                        catchError("dependence", [extension.manifesto.name + " dependence " + dependenceExtensionName + " is not found"])
                    } else {
                        if (dependenceExtension.manifesto.coreDependence) {
                            if (dependenceExtension.manifesto.coreDependence === "" || !compareDependenceVersion(dependenceExtension.manifesto.version, extension.manifesto.dependence![dependenceExtensionName])) {
                                catchError("dependence", [extension.manifesto.name + " dependence " + dependenceExtensionName + " coreDependence is not match"])
                            }
                        }
                    }
                })
            }
        });

        //extensions loader & add task , endpoint
        this.extensions.forEach((extension) => {
            if (typeof extension.init === "function") {
                extension.init(this.turboSearchKit());
            }
        });

    }

    // APIなど外部から参照されるような処理を追加する
    addEndpoint(endpoint: AddEndpointData) {
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
    addTask(task: AddTaskData) {
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
    addTaskAndEndpoint(taskAndEndpoint: AddTaskAndEndpointData) {
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
            tasks: this.tasks
        }
    }

}