import Z from "zod";
import { TurboSearchKit } from "../../..";

export type RankerManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Ranker = {
  requestSchema: Z.Schema;
  outputSchema: Z.Schema;
  rankerManifesto: RankerManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  process: (
    requestData: Z.infer<Ranker["requestSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | {
      success: false;
      message: string;
      error: any;
    }
    | {
      success: true;
      output: Z.infer<AddRankerData["outputSchema"]>;
    }
  >;
};