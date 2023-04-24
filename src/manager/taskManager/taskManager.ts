import { catchError } from '../../error/catchError.js';
import { AddTaskData, TaskManager, Tasks } from './taskManagerType.js';
import { addTaskSchema } from "./taskSchema.js";

export class taskManager implements TaskManager {

    private _tasks: Tasks = {};

    //DBなど内部から参照されるような処理を追加する
    async addTask(task: AddTaskData) {

        //バリデーションする
        const addTaskData = addTaskSchema.safeParse(task);
        if (!addTaskData.success) {
            catchError("taskValidation", [
                `Failed to add ${task.name} task`,
                addTaskData.error.message,
            ]);
        } else {
            if (!this._tasks[task.provider || "other"]) {
                this._tasks[task.provider || "other"] = {};
            }
            //すでに存在するか確かめる
            if (!this._tasks[task.provider || "other"][task.name] || addTaskData.data.forcedAssignment) {
                this._tasks[task.provider || "other"][task.name] = addTaskData.data;
            } else {
                catchError("taskValidation", [
                    `Failed to add ${task.name} task`,
                    `The task name ${task.name} is already in use`,
                ]);
            }
        }
    }

    get tasks() {
        return this._tasks;
    }
}