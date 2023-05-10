//タスクを追加するときのデータ
export type AddTaskData = {
    name: string;
    provider: "core" | string;
    function: (request: any, option?: any) => Promise<any | void>;
    forcedAssignment?: boolean;
};

//タスクのデータ
export type Task = {
    name: string;
    provider: "core" | string;
    function: (request: any, option?: any) => Promise<any | void>;
};

export type Tasks = { [provider: string]: { [taskName: string]: Task } };
