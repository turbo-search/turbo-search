export type ExtensionManager = {

    //同じ名前の拡張機能がないかどうかチェック
    checkDuplicateExtensionName: () => Promise<void>,

    //check extensions manifesto
    checkManifesto: () => Promise<void>,

    //extensions available check
    checkAvailable: () => Promise<void>,

    //dependencies check
    checkDependence: () => Promise<void>,

    //extensions loader & add task , endpoint
    load: (turboSearchKit: TurboSearchKit) => Promise<void>,

    //get extensions
    getExtensions: () => Promise<Extension[]>,

    //setup extensions
    setupExtensions: () => Promise<Extension[]>,
}
