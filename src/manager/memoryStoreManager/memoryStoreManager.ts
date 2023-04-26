import { MemoryStoreManager } from "./memoryStoreManagerType";

export class memoryStoreManager implements MemoryStoreManager {

    public data: { [table: string]: any[] } = {};

    public async add(table: string, _data: any) {
        if (!this.data[table]) {
            this.data[table] = [];
        }
        this.data[table].push(_data);
    }

    public async find(table: string, key: string, value: any) {
        const result = this.data[table].filter((data) => {
            return data[key] === value;
        });
        return result;
    }

    public async update(table: string, key: string, value: any, _data: any) {
        this.data[table] = this.data[table].map((data) => {
            if (data[key] === value) {
                return _data;
            }
            return data;
        });
    }

    public async delete(table: string, key: string, value: any) {
        this.data[table] = this.data[table].filter((data) => {
            return data[key] !== value;
        });
    }

}