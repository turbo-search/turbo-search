
//タスクのデータ
export type Task = {
    name: string;
    provider: "core" | string;
    function: (request: any, option?: any) => Promise<any | void>;
    forcedAssignment?: boolean;
};

export type Tasks = { [provider: string]: { [taskName: string]: Task } };
