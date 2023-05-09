
export type databaseManifesto = {
    name: string;
    coreDependence?: string;
    version: string;

}

export type Database = {
    databaseManifesto: databaseManifesto;
    init?: () => Promise<void>;
    addData: (data: any) => Promise<void | any>;
    addDataArray?: (data: any[]) => Promise<void | any>;
    deleteData?: (data: any) => Promise<void | any>;
    updateData?: (data: any) => Promise<void | any>;
    getAllData?: () => Promise<any>;
    fullTextSearch?: (data: any) => Promise<any>;
    vectorSearch?: (data: any) => Promise<any>;
    search?: (order: any, data: any) => Promise<any>;
}

export type AddDatabaseData = Database;