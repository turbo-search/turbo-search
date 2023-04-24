import Z from "zod";
import { DatabaseKit } from "../../../indexType";

//class
export type addMiddlewareData = {
    inputSchema: Z.Schema;
    outputSchema: Z.Schema;
    process: (
        inputData: Z.infer<addMiddlewareData["inputSchema"]>,
        databaseKit: DatabaseKit
    ) => Promise<{
        success: false;
        message: string;
        error: any;
    } | {
        success: true;
        output: Z.infer<addMiddlewareData["outputSchema"]>;
    }>
}

export type middleware = {

}
