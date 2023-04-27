export type MemoryStoreManager = {

    data: { [table: string]: any[] }

    // メモリストアにデータを追加する
    add: (table: string, _data: any) => Promise<void>;

    // メモリストアからデータを取得する
    find: (table: string, key: string, value: any) => Promise<any[]>;

    // メモリストアからデータを全件取得する
    findAll: (table: string) => Promise<any[]>;

    // メモリストアからデータをアップデートする
    update: (table: string, key: string, value: any, _data: any) => Promise<void>;

    // メモリストアからデータを削除する
    delete: (table: string, key: string, value: any) => Promise<any[]>;
}