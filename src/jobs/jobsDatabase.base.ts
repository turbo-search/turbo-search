export type Job = {
    id: string,
    name: string,
    description: string,
    point: "core" | "extension" | "search" | "crawler" | "indexer" | "pipe" | "middleware",
    performer: string,
    logs: {
        time: string,
        text: string
    }[],
}

export type AddJobData = {
    name: string,
    description: string,
    point: Job["point"],
    performer: string,
}

export abstract class jobsDatabase {
    private initialized = false;

    init() {
        this.initialized = true;
        return this._init()
    }
    abstract _init(): Promise<void>;

    addJob(job: AddJobData) {
        return this._addJob(job)
    }
    abstract _addJob(job: AddJobData): Promise<Job>;

    getJob(id: string) {
        return this._getJob(id)
    }
    abstract _getJob(id: string): Promise<Job>;

    getJobs() {
        return this._getJobs()
    }
    abstract _getJobs(): Promise<Job[]>;

    updateJob(id: string, job: Partial<Job>) {
        return this._updateJob(id, job)
    }
    abstract _updateJob(id: string, job: Partial<Job>): Promise<Job>;

    deleteJob(id: string) {
        return this._deleteJob(id)
    }
    abstract _deleteJob(id: string): Promise<Job>;

    addLogs(id: string, logs: Job["logs"]) {
        return this._addLogs(id, logs)
    }
    abstract _addLogs(id: string, logs: Job["logs"]): Promise<Job>;

}