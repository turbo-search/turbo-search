import { JobStatus, Jobs, SubscribeJobCallback } from "./jobs.base";
import { Job } from "./jobsDatabase.base";
import { jobsDefaultMemoryDatabase } from "./jobsDefaultMemoryDatabase";

export class jobs extends Jobs {

    private jobsDatabase = new jobsDefaultMemoryDatabase();
    private subscribeJobList: { [key: string]: { [key: string]: SubscribeJobCallback } } = {};
    private subscribeJobsList: { [key: string]: SubscribeJobCallback } = {};

    constructor() {
        super();
        this.jobsDatabase.init();
    }

    async _getJob(id: string) {
        return await this.jobsDatabase.getJob(id)
    }

    async _getJobs() {
        return await this.jobsDatabase.getJobs()
    }

    async _addJob(job: Job) {
        const addJob = await this.jobsDatabase.addJob(job)
        if (this.subscribeJobList[job.id]) {
            Object.values(this.subscribeJobList[job.id]).map((callback) => {
                callback(job, "add")
            })
        }

        if (this.subscribeJobsList) {
            Object.values(this.subscribeJobsList).map((callback) => {
                callback(job, "add")
            })
        }

        return addJob;
    }

    async _updateJob(id: string, job: Partial<Job>) {
        const updatedJob = await this.jobsDatabase.updateJob(id, job)
        if (this.subscribeJobList[id]) {
            Object.values(this.subscribeJobList[id]).map((callback) => {
                callback(updatedJob, "update")
            })
        }

        if (this.subscribeJobsList) {
            Object.values(this.subscribeJobsList).map((callback) => {
                callback(updatedJob, "update")
            })
        }
        return updatedJob;
    }

    async _deleteJob(id: string) {
        const deletedJob = await this.jobsDatabase.deleteJob(id)
        if (this.subscribeJobList[id]) {
            Object.values(this.subscribeJobList[id]).map((callback) => {
                callback(deletedJob, "delete")
            })
        }

        if (this.subscribeJobsList) {
            Object.values(this.subscribeJobsList).map((callback) => {
                callback(deletedJob, "delete")
            })
        }
        return deletedJob;
    }

    async _addLogs(id: string, logs: Job["logs"]) {
        const addLogsJob = await this.jobsDatabase.addLogs(id, logs);
        if (this.subscribeJobList[id]) {
            Object.values(this.subscribeJobList[id]).map((callback) => {
                callback(addLogsJob, "addLogs")
            })
        }

        if (this.subscribeJobsList) {
            Object.values(this.subscribeJobsList).map((callback) => {
                callback(addLogsJob, "addLogs")
            })
        }
        return addLogsJob;
    }

    _subscribeJob(id: string, subscribeId: string, callback: SubscribeJobCallback) {
        if (!this.subscribeJobList[id]) {
            this.subscribeJobList[id] = {};
        }
        this.subscribeJobList[id][subscribeId] = callback;
        return Promise.resolve()
    }

    _unsubscribeJob(id: string, subscribeId: string) {
        if (this.subscribeJobList[id]) {
            delete this.subscribeJobList[id][subscribeId];
        }
        return Promise.resolve()
    }

    _subscribeJobs(subscribeId: string, callback: SubscribeJobCallback) {
        this.subscribeJobsList[subscribeId] = callback;
        return Promise.resolve()
    }

    _unsubscribeJobs(subscribeId: string) {
        delete this.subscribeJobsList[subscribeId];
        return Promise.resolve()
    }

}