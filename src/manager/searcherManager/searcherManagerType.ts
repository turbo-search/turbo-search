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

export type Searcher = {
  searcherManifesto: SearcherManifesto,
  init?: (dataManagementKit: DataManagementKit) => Promise<void>;
  middleware: Middleware[];
  ranker: Ranker;
  pipe: Pipe[];
  interceptor: Interceptor;
}

export type AddSearcherData = Searcher;