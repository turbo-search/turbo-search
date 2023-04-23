import { Adder } from "../indexType";
import type Z from "zod";

export type AdderManager = {

    //スキーマによるチェック
    checkSchema: () => void,

    //実行
    run: (adderName: Adder["name"], input: object) => Promise<
        { success: false, message: string, ran: string[] }
        |
        { success: false, message: string, error: Z.ZodError<any>, ran: string[] }
        |
        { success: true, output: object, ran: string[] }
    >,

    //coreToCrawlerを実行する
    runCoreToCrawler: (adder: Adder, input: object) => Promise<object>,
}