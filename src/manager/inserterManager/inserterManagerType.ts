import { Crawler } from "../api/crawlerManager/crawlerManagerType";
import { Indexer } from "../api/indexerManager/indexerManagerType";
import { Pipe } from "../api/pipeManager/pipeManagerType";
import { Middleware } from "../api/middlewareManager/middlewareManagerType";
import { TurboSearchKit } from "../..";

export type Ran = "middleware" | "crawler" | "pipe" | "indexer";

export type InserterManifesto = {
  name: string;
  queryPath?: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Inserter = {
  inserterManifesto: InserterManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  middleware: Middleware[];
  crawler: Crawler;
  pipe: Pipe[];
  indexer: Indexer;
};

export type AddInserterData = Inserter;
