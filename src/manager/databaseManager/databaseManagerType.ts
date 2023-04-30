
export type databaseManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

//class
export type AddDatabaseData = {
    databaseManifesto: databaseManifesto;
    init?: () => Promise<void>;
    addData: (data: any) => Promise<void | any>;
    getAllData?: () => Promise<any>;
    fullTextSearch?: (query: string) => Promise<any>;
    vectorSearch?: (query: string) => Promise<any>;
}

export type Database = {
    databaseManifesto: databaseManifesto;
    init?: () => Promise<void>;
    addData: (data: any) => Promise<void | any>;
    deleteData?: (data: any) => Promise<void | any>;
    updateData?: (data: any) => Promise<void | any>;
    getAllData?: () => Promise<any>;
    fullTextSearch?: (query: string) => Promise<any>;
    vectorSearch?: (query: string) => Promise<any>;
}

export type DatabaseManager = {

    init: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    addData: (data: any) => Promise<void | any>;

    deleteData: (data: any) => Promise<void | any>;

    updateData: (data: any) => Promise<void | any>;

    getAllData: () => Promise<any>;

    fullTextSearch: (query: string) => Promise<any>;

    vectorSearch: (query: string) => Promise<any>;

    methods: {
        addData: boolean,
        deleteData: boolean,
        updateData: boolean,
        getAllData: boolean,
        fullTextSearch: boolean,
        vectorSearch: boolean,
    }

}