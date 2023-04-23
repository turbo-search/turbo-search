import { Job } from "./jobsDatabase.base";

export type JobStatus = "add" | "update" | "addLogs" | "delete";
export type SubscribeJobCallback = (job: Job, status: JobStatus) => Promise<void>;

export abstract class Jobs {

    getJob(id: string) {
        return this._getJob(id)
    }
    abstract _getJob(id: string): Promise<Job>;

    getJobs() {
        return this._getJobs()
    }
    abstract _getJobs(): Promise<Job[]>;

    addJob(job: Job) {
        return this._addJob(job)
    }
    abstract _addJob(job: Job): Promise<Job>;

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

    subscribeJob(id: string, subscribeId: string, callback: SubscribeJobCallback) {
        return this._subscribeJob(id, subscribeId, callback)
    }
    abstract _subscribeJob(id: string, subscribeId: string, callback: SubscribeJobCallback): Promise<void>;

    unsubscribeJob(id: string, subscribeId: string) {
        return this._unsubscribeJob(id, subscribeId)
    }
    abstract _unsubscribeJob(id: string, subscribeId: string): Promise<void>;

    subscribeJobs(subscribeId: string, callback: SubscribeJobCallback) {
        return this._subscribeJobs(subscribeId, callback)
    }
    abstract _subscribeJobs(subscribeId: string, callback: SubscribeJobCallback): Promise<void>;

    unsubscribeJobs(subscribeId: string) {
        return this._unsubscribeJobs(subscribeId)
    }
    abstract _unsubscribeJobs(subscribeId: string): Promise<void>;
}