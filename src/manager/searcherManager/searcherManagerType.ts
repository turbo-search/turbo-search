import { Ranker } from "../api/rankerManager/rankerManagerType";
import { Interceptor } from "../api/interceptorManager/interceptorManagerType";
import { Pipe } from "../api/pipeManager/pipeManagerType";
import { Middleware } from "../api/middlewareManager/middlewareManagerType";
import { TurboSearchKit } from "../../indexType";

export type Ran = "middleware" | "ranker" | "pipe" | "interceptor";

export type SearcherManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Searcher = {
  searcherManifesto: SearcherManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  middleware: Middleware[];
  ranker: Ranker;
  pipe: Pipe[];
  interceptor: Interceptor;
};