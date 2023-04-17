export type addTaskError = {
    code: number,
    message: string
}
export type addEndpoint = () => true | addTaskError;
export type Endpoint = () => {}

export type extensionManifesto = {
    name: string
}

export type Extensions = {
    init?: () => void,
    available?: () => { success: false, message: string } | { success: true },
    addTask?: (addEndpoint: addEndpoint) => void,
    manifesto: extensionManifesto
};

export type TurboSearchCoreOptions = {
    extensions: Extensions[],
    error: {
        strictAvailable?: boolean
    }
}