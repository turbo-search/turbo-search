import { AddJobData, Job, jobsDatabase } from "./jobsDatabase.base";
import { v4 as uuidv4 } from 'uuid';

export class jobsDefaultMemoryDatabase extends jobsDatabase {
    public jobs: Job[] = [];

    constructor() {
        super();
    }

    _init(): Promise<void> {
        this.jobs = [];
        return Promise.resolve();
    }

    _addJob(job: AddJobData): Promise<Job> {
        const newJob: Job = {
            id: uuidv4(),
            name: job.name,
            description: job.description,
            point: job.point,
            performer: job.performer,
            logs: [],
        }
        this.jobs.push(newJob);

        return Promise.resolve(newJob);
    }

    _getJob(id: string): Promise<Job> {
        const job = this.jobs.find(job => job.id === id);
        if (!job) {
            return Promise.reject(new Error("Job not found"))
        }
        return Promise.resolve(job);
    }

    _getJobs(): Promise<Job[]> {
        return Promise.resolve(this.jobs);
    }

    _updateJob(id: string, job: Partial<Job>): Promise<Job> {
        const oldJob = this.jobs.find(job => job.id === id);
        if (!oldJob) {
            return Promise.reject(new Error("Job not found"))
        }
        const newJob = { ...oldJob, ...job };
        this.jobs = this.jobs.map(job => job.id === id ? newJob : job);
        return Promise.resolve(newJob);
    }

    _deleteJob(id: string): Promise<Job> {
        this.jobs = this.jobs.filter(job => job.id !== id);
        return Promise.resolve(this.jobs.filter(job => job.id === id)[0]);
    }

    _addLogs(id: string, logs: Job["logs"]): Promise<Job> {
        const oldJob = this.jobs.find(job => job.id === id);
        if (!oldJob) {
            return Promise.reject(new Error("Job not found"))
        }
        const newJob = { ...oldJob, logs: [...oldJob.logs, ...logs] };
        this.jobs = this.jobs.map(job => job.id === id ? newJob : job);
        return Promise.resolve(newJob);
    }

}