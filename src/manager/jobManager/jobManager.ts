import {
  AddJobData,
  Job,
  JobStatus,
  SubscribeJobCallback,
} from "./jobManagerType";
import {
  addJobDataSchema,
  addSubscribeJobDataSchema,
  addSubscribeJobsDataSchema,
} from "./jobManagerSchema";
import { v4 as uuidv4 } from "uuid";
import { catchError } from "../../error/catchError";
import { MemoryStoreManager } from "../memoryStoreManager/memoryStoreManager";

export class JobManager {
  constructor(private memoryStoreManager: MemoryStoreManager) {}

  async getJob(id: string) {
    const jobs = (await this.memoryStoreManager.find("jobs", "id", id)) as
      | Job[]
      | undefined;
    if (typeof jobs != "undefined" && jobs.length != 0) {
      return jobs[0];
    } else {
      return undefined;
    }
  }

  async getJobs() {
    return (await this.memoryStoreManager.findAll("jobs")) as Job[];
  }

  async addJob(addJobData: AddJobData) {
    //zod validation
    const result = addJobDataSchema.safeParse(addJobData);
    if (!result.success) {
      catchError("jobValidation", [
        "job validation error",
        "job : " + addJobData.name,
        "error : " + result.error.message,
      ]);
    } else {
      const safeAddJobData = result.data as AddJobData;
      const job: Job = {
        id: uuidv4(),
        name: safeAddJobData.name,
        description: safeAddJobData.description,
        point: safeAddJobData.point,
        performer: safeAddJobData.performer,
        logs: [],
      };
      await this.memoryStoreManager.add("jobs", job);

      //subscribe
      await this.checkSubscribe(job, "add");

      return job;
    }
  }

  async updateJob(id: string, job: Job) {
    await this.memoryStoreManager.update("jobs", "id", id, job);

    //subscribe
    await this.checkSubscribe(job, "update");
  }

  async deleteJob(id: string) {
    const deletedData = await this.memoryStoreManager.delete("jobs", "id", id);

    //subscribe
    deletedData.forEach(async (job) => {
      await this.checkSubscribe(job, "delete");
    });
  }

  async addLogs(id: string, logs: Job["logs"]) {
    const job = await this.getJob(id);
    if (typeof job != "undefined") {
      job.logs.push(...logs);
      await this.memoryStoreManager.update("jobs", "id", id, job);

      //subscribe
      await this.checkSubscribe(job, "addLogs");

      return job;
    } else {
      return undefined;
    }
  }

  //一つのjobの変更をsubscribeする
  async subscribeJob(
    id: string, //サブスクライブ固有のid
    jobId: string, //サブスクライブするjobのid
    callback: SubscribeJobCallback
  ) {
    const result = addSubscribeJobDataSchema.safeParse({
      id: id,
      jobId: jobId,
      callback: callback,
    });
    if (!result.success) {
      catchError("jobSubscribeValidation", [
        "job subscribe validation error",
        "subscribe id : " + id,
        "error : " + result.error.message,
      ]);
    } else {
      //同じidが存在する場合も関係なく追加
      await this.memoryStoreManager.add("jobSubscribes", result.data);
    }
  }

  async unsubscribeJob(id: string) {
    await this.memoryStoreManager.delete("jobSubscribes", "id", id);
  }

  //すべてのjobの変更をsubscribeする
  async subscribeJobs(
    id: string,
    callback: SubscribeJobCallback
  ): Promise<void> {
    const result = addSubscribeJobsDataSchema.safeParse({
      id: id,
      callback: callback,
    });
    if (!result.success) {
      catchError("jobsSubscribeValidation", [
        "jobs subscribe validation error",
        "subscribe id : " + id,
        "error : " + result.error.message,
      ]);
    } else {
      //同じidが存在する場合も関係なく追加
      await this.memoryStoreManager.add("jobsSubscribes", result.data);
    }
  }

  async unsubscribeJobs(id: string) {
    await this.memoryStoreManager.delete("jobsSubscribes", "id", id);
  }

  async checkSubscribe(job: Job, status: JobStatus) {
    const subscribeJobList = (await this.memoryStoreManager.find(
      "jobSubscribes",
      "jobId",
      job.id
    )) as { id: string; jobId: string; callback: SubscribeJobCallback }[];
    const subscribeJobsList = (await this.memoryStoreManager.findAll(
      "jobsSubscribes"
    )) as { id: string; callback: SubscribeJobCallback }[];

    subscribeJobList.forEach((subscribeJob) => {
      subscribeJob.callback(job, status);
    });

    subscribeJobsList.forEach((subscribeJobs) => {
      subscribeJobs.callback(job, status);
    });
  }
}
