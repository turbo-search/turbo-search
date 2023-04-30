import { catchError } from '../../error/catchError.js';
import { AddTaskData, Tasks } from './taskManagerType.js';
import { addTaskSchema } from "./taskSchema.js";

export class TaskManager {

    tasks: Tasks;

    constructor() {
        this.tasks = {};
    }

    //DBなど内部から参照されるような処理を追加する
    async addTask(task: AddTaskData) {

        if (typeof this.tasks == "undefined") {
            this.tasks = {};
        }

        //バリデーションする
        const addTaskData = addTaskSchema.safeParse(task);
        if (!addTaskData.success) {
            catchError("taskValidation", [
                `Failed to add ${task.name} task`,
                addTaskData.error.message,
            ]);
        } else {
            if (!this.tasks[task.provider || "other"]) {
                this.tasks[task.provider || "other"] = {};
            }
            //すでに存在するか確かめる
            if (!this.tasks[task.provider || "other"][task.name] || addTaskData.data.forcedAssignment) {
                this.tasks[task.provider || "other"][task.name] = addTaskData.data;
            } else {
                catchError("taskValidation", [
                    `Failed to add ${task.name} task`,
                    `The task name ${task.name} is already in use`,
                ]);
            }
        }
    }

}