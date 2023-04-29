import Z from "zod";

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
    getAllData?: () => Promise<any>;
    fullTextSearch?: (query: string) => Promise<any>;
    vectorSearch?: (query: string) => Promise<any>;
}

export type DatabaseManager = {

    init: () => Promise<void>;

    checkDependence: () => Promise<void>;

    setup: () => Promise<void>;

    addData: (data: any) => Promise<void | any>;

    getAllData: () => Promise<any>;

    fullTextSearch: (query: string) => Promise<any>;

    vectorSearch: (query: string) => Promise<any>;

    methods: {
        getAllData: boolean,
        fullTextSearch: boolean,
        vectorSearch: boolean,
    }

}