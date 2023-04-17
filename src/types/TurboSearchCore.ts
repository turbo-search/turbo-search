export type addTaskError = {
    code: number,
    message: string
}
export type addEndpoint = () => true | addTaskError;
export type Endpoint = () => {}

export type Extensions = {
    load?: () => void,
    available?: () => true | string,
    addTask?: (addEndpoint: addEndpoint) => void
};

export type TurboSearchCoreOptions = {
    extensions: Extensions[],
    error: {
        strictAvailable?: boolean
    }
}