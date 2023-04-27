export type Job = {
    id: string;
    name: string;
    description: string;
    point:
    | "core"
    | "extension"
    | "search"
    | "crawler"
    | "indexer"
    | "pipe"
    | "middleware";
    performer: string;
    logs: {
        time: string;
        text: string;
    }[];
};

export type AddJobData = {
    name: string;
    description: string;
    point:
    | "core"
    | "extension"
    | "search"
    | "crawler"
    | "indexer"
    | "pipe"
    | "middleware";
    performer: string;
}

export type JobStatus = "add" | "update" | "addLogs" | "delete";
export type SubscribeJobCallback = (
    job: Job,
    status: JobStatus
) => Promise<void>;

export type JobManager = {

    getJob(id: string): Promise<Job | undefined>;

    getJobs(): Promise<Job[]>;

    addJob(job: Job): Promise<Job | void>;

    updateJob(id: string, job: Job): Promise<void>;

    deleteJob(id: string): Promise<void>;

    addLogs(id: string, logs: Job["logs"]): Promise<Job | undefined>;

    subscribeJob(
        id: string,
        jobId: string,
        callback: SubscribeJobCallback
    ): Promise<void>;

    unsubscribeJob(id: string, subscribeId: string): Promise<void>;

    subscribeJobs(subscribeId: string, callback: SubscribeJobCallback): Promise<void>;

    unsubscribeJobs(subscribeId: string): Promise<void>;

    checkSubscribe(job: Job, status: JobStatus): Promise<void>;

}