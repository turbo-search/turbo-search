import type Z from "zod";
import { Ranker } from "../api/rankerManager/rankerManagerType";
import { Interceptor } from "../api/interceptorManager/interceptorManagerType";
import { Pipe } from "../api/pipeManager/pipeManagerType";
import { Middleware } from "../api/middlewareManager/middlewareManagerType";
import { DataManagementKit } from "../../indexType";

export type Ran =
  | "middleware"
  | "ranker"
  | "pipe"
  | "interceptor";

export type SearcherManifesto = {
  name: string;
  coreDependence?: string;
  version: string;
}

export type AddSearcherData = {
  searcherManifesto: SearcherManifesto,
  init?: (dataManagementKit: DataManagementKit) => Promise<void>;
  middleware: Middleware[];
  ranker: Ranker;
  pipe: Pipe[];
  interceptor: Interceptor;
};

export type Searcher = {
  searcherManifesto: SearcherManifesto,
  init?: (dataManagementKit: DataManagementKit) => Promise<void>;
  middleware: Middleware[];
  ranker: Ranker;
  pipe: Pipe[];
  interceptor: Interceptor;
}

export type SearcherManager = {
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
