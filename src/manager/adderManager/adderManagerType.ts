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
