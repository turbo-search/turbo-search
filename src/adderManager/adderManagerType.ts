import { Adder } from "../indexType";
import type Z from "zod";

export type Ran =
  | "coreToCrawler"
  | "crawler"
  | "crawlerToIndexer"
  | "indexer"
  | "indexerToCore";

export type AdderManager = {
  //スキーマによるチェック
  checkSchema: () => void;

  //実行
  run: (
    adderName: Adder["name"],
    input: object
  ) => Promise<
    | { success: false; message: string; ran: Ran[] }
    | { success: false; message: string; error: Z.ZodError<any>; ran: Ran[] }
    | { success: true; output: object; ran: Ran[] }
  >;

  //coreToCrawlerを実行する
  runCoreToCrawler: (
    adder: Adder,
    input: object
  ) => Promise<
    | { success: true; data: object }
    | { success: false; message: string; error: any }
  >;

  //crawlerを実行する
  runCrawler: (
    adder: Adder,
    input: object
  ) => Promise<
    | { success: true; data: object }
    | { success: false; message: string; error: any }
  >;

  //crawlerToIndexerを実行する
  runCrawlerToIndexer: (
    adder: Adder,
    input: object
  ) => Promise<
    | { success: true; data: object }
    | { success: false; message: string; error: any }
  >;

  //indexerを実行する
  runIndexer: (
    adder: Adder,
    input: object
  ) => Promise<
    | { success: true; data: object }
    | { success: false; message: string; error: any }
  >;

  //indexerToCoreを実行する
  runIndexerToCore: (
    adder: Adder,
    input: object
  ) => Promise<
    | { success: true; data: object }
    | { success: false; message: string; error: any }
  >;
};
