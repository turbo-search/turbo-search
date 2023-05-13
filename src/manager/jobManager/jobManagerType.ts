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
};

export type JobStatus = "add" | "update" | "addLogs" | "delete";
export type SubscribeJobCallback = (
  job: Job,
  status: JobStatus
) => Promise<void>;
