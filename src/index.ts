import { Extensions, Endpoint, TurboSearchCoreOptions, addEndpoint } from "./types/index.js";

export class turboSearchCore {

    private extensions: Extensions[] = [];
    private endpoints: Endpoint[] = [];

    constructor(options: TurboSearchCoreOptions) {
        this.extensions = options.extensions;

        //extensions available check
        this.extensions.map((extension) => {
            if (typeof extension.available !== "function") {
                return true
            } else {
                const extensionAvailable = extension.available();
                if (extensionAvailable) {
                    return true
                } else {
                    if (options.error.strictAvailable) {
                        throw new Error(extensionAvailable)
                    } else {
                        //TODO:Error Log
                    }
                }
            }
        });

        //extensions loader & add task
        this.extensions.forEach((extension) => {
            if (typeof extension.load === "function") {
                extension.load();
            }
        });

    }

    addEndpoint() {

    }

}
