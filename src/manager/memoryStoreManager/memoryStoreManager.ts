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
        if (!this.data[table]) {
            this.data[table] = [];
        }
        const result = this.data[table].filter((data) => {
            return data[key] === value;
        });
        return result;
    }

    public async findAll(table: string) {
        if (!this.data[table]) {
            this.data[table] = [];
        }
        return this.data[table];
    }

    public async update(table: string, key: string, value: any, _data: any) {
        if (!this.data[table]) {
            this.data[table] = [];
        }
        this.data[table] = this.data[table].map((data) => {
            if (data[key] === value) {
                return _data;
            }
            return data;
        });
    }

    public async delete(table: string, key: string, value: any) {
        if (!this.data[table]) {
            this.data[table] = [];
        }

        const deletedData = this.data[table].filter((data) => {
            return data[key] === value;
        });

        this.data[table] = this.data[table].filter((data) => {
            return data[key] !== value;
        });

        return deletedData;
    }

}