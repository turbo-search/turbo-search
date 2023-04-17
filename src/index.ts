import { catchError } from "./error/index.js";
import { Extensions, Endpoint, TurboSearchCoreOptions, addEndpoint } from "./index.d.js";

export class turboSearchCore {

    private extensions: Extensions[] = [];
    private endpoints: Endpoint[] = [];

    constructor(options: TurboSearchCoreOptions) {
        this.extensions = options.extensions;

        //check extensions manifesto
        this.extensions.forEach((extension, index) => {
            if (!extension.manifesto.name) {
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
                    if (options.error.strictAvailable) {
                        catchError("available", [extension.manifesto.name + " is not available"])
                    } else {
                        //TODO:Error Log
                    }
                }
            }
        });

        //extensions loader & add task
        this.extensions.forEach((extension) => {
            if (typeof extension.init === "function") {
                extension.init();
            }
        });

    }

    addEndpoint() {

    }

}