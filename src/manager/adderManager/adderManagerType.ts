import type Z from "zod";
import { Crawler } from "../api/crawlerManager/crawlerManagerType";
import { Indexer } from "../api/indexerManager/indexerManagerType";
import { Pipe } from "../api/pipeManager/pipeManagerType";
import { Middleware } from "../api/middlewareManager/middlewareManagerType";
import { DataManagementKit } from "../../indexType";

export type Ran =
  | "middleware"
  | "crawler"
  | "pipe"
  | "indexer";

export type AdderManifesto = {
  name: string;
  queryPath?: string;
  coreDependence?: string;
  version: string;
}

export type AddAdderData = {
  adderManifesto: AdderManifesto,
  init?: (dataManagementKit: DataManagementKit) => Promise<void>;
  middleware: Middleware[];
  crawler: Crawler;
  pipe: Pipe[];
  indexer: Indexer;
};

export type Adder = {
  adderManifesto: AdderManifesto,
  init?: (dataManagementKit: DataManagementKit) => Promise<void>;
  middleware: Middleware[];
  crawler: Crawler;
  pipe: Pipe[];
  indexer: Indexer;
}

export type AdderManager = {
  // スキーマによるチェック
  checkSchema: () => void;

  init: () => Promise<void>;

  checkDependence: () => Promise<void>;

  addEndpoint: () => Promise<void>;

  // setup
  setup: () => Promise<void>;

  //実行
  process: (
    request: any
  ) => Promise<
    | { success: false; message: string; ran: Ran[] }
    | { success: false; message: string; error: any; ran: Ran[] }
    | { success: true; output: any; ran: Ran[] }
  >;

};
