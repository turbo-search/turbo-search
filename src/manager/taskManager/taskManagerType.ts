//タスクを追加するときのデータ
export type AddTaskData = {
    name: string;
    provider: "core" | string;
    function: () => void;
    forcedAssignment?: boolean;
};

//タスクのデータ
export type Task = {
    name: string;
    provider: "core" | string;
    function: () => void;
};

export type Tasks = { [provider: string]: { [taskName: string]: Task } };

export type TaskManager = {
    addTask: (task: AddTaskData) => Promise<void>;
    tasks: Tasks;
}