import { catchError } from "@/error/catchError";
import { taskSchema } from "./taskSchema";

//タスクのデータ
export type Task = {
  name: string;
  provider: "core" | string;
  function: (request: any, option?: any) => Promise<any | void>;
  forcedAssignment?: boolean;
};

export type Tasks = { [provider: string]: { [taskName: string]: Task } };


export class TaskManager {
  tasks: Tasks;

  constructor() {
    this.tasks = {};
  }

  //DBなど内部から参照されるような処理を追加する
  async addTask(addTaskData: Task) {
    if (typeof this.tasks == "undefined") {
      this.tasks = {};
    }

    //バリデーションする
    const result = taskSchema.safeParse(addTaskData);
    if (!result.success) {
      catchError("taskValidation", [
        `Failed to add ${addTaskData.name} task`,
        result.error.message,
      ]);
    } else {
      if (!this.tasks[addTaskData.provider || "other"]) {
        this.tasks[addTaskData.provider || "other"] = {};
      }
      //すでに存在するか確かめる
      if (
        !this.tasks[addTaskData.provider || "other"][addTaskData.name] ||
        addTaskData.forcedAssignment
      ) {
        this.tasks[addTaskData.provider || "other"][addTaskData.name] =
          addTaskData;
      } else {
        catchError("taskValidation", [
          `Failed to add ${addTaskData.name} task`,
          `The task name ${addTaskData.name} is already in use`,
        ]);
      }
    }
  }
}
