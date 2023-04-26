import { MemoryStoreManager } from "../memoryStoreManager/memoryStoreManagerType";
import { AddJobData, Job, JobManager } from "./jobManagerType";
import { addJobDataSchema } from "./jobManagerSchema";
import { v4 as uuidv4 } from 'uuid';
import { catchError } from "../../error/catchError";

export class jobManager implements JobManager {

    constructor(private memoryStoreManager: MemoryStoreManager) {

    }

    async getJob(id: string) {
        const jobs = await this.memoryStoreManager.find("jobs", "id", id) as Job[] | undefined
        if (typeof jobs != "undefined" && jobs.length != 0) {
            return jobs[0];
        } else {
            return undefined;
        }
    }

    async getJobs() {
        return await this.memoryStoreManager.findAll("jobs") as Job[]
    }

    async addJob(addJobData: AddJobData) {
        //zod validation
        const result = addJobDataSchema.safeParse(addJobData);
        if (!result.success) {
            catchError("jobValidation", ["job validation error", "job : " + addJobData.name, "error : " + result.error.message])
        } else {
            const safeAddJobData = result.data as AddJobData;
            const job: Job = {
                id: uuidv4(),
                name: safeAddJobData.name,
                description: safeAddJobData.description,
                point: safeAddJobData.point,
                performer: safeAddJobData.performer,
                logs: []
            }
            await this.memoryStoreManager.add("jobs", job);
            return job;
        }
    }

    async updateJob(id: string, job: Partial<Job>) {
        await this.memoryStoreManager.update("jobs", "id", id, job);
    }

    async deleteJob(id: string) {
        await this.memoryStoreManager.delete("jobs", "id", id);
    }

    async addLogs(id: string, logs: Job["logs"]) {
        const job = await this.getJob(id);
        if (typeof job != "undefined") {
            job.logs.push(...logs);
            await this.memoryStoreManager.update("jobs", "id", id, job);
            return job;
        } else {
            return undefined;
        }
    }

}