import { catchError } from '../../error/catchError.js';
import { AddTaskData, Tasks } from './taskManagerType.js';
import { addTaskSchema } from "./taskSchema.js";

export class TaskManager {

    tasks: Tasks;

    constructor() {
        this.tasks = {};
    }

    //DBなど内部から参照されるような処理を追加する
    async addTask(addTaskData: AddTaskData) {

        if (typeof this.tasks == "undefined") {
            this.tasks = {};
        }

        //バリデーションする
        const result = addTaskSchema.safeParse(addTaskData);
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
            if (!this.tasks[addTaskData.provider || "other"][addTaskData.name] || addTaskData.forcedAssignment) {
                this.tasks[addTaskData.provider || "other"][addTaskData.name] = addTaskData;
            } else {
                catchError("taskValidation", [
                    `Failed to add ${addTaskData.name} task`,
                    `The task name ${addTaskData.name} is already in use`,
                ]);
            }
        }
    }

}