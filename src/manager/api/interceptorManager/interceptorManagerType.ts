import Z from "zod";
import { TurboSearchKit } from "../../..";

export type InterceptorManifesto = {
  name: string;
  coreDependence?: string;
  databaseDependence?: {
    name: string;
    version: string;
  }[];
  extensionDependence?: { [extensionName: string]: string };
  version: string;
};

export type Interceptor = {
  requestSchema: Z.Schema;
  inputSchema: Z.Schema;
  outputSchema: Z.Schema;
  interceptorManifesto: InterceptorManifesto;
  init?: (turboSearchKit: TurboSearchKit) => Promise<void>;
  process: (
    requestData: Z.infer<Interceptor["requestSchema"]>,
    inputData: Z.infer<Interceptor["inputSchema"]>,
    turboSearchKit: TurboSearchKit
  ) => Promise<
    | {
      success: false;
      message: string;
      error: any;
    }
    | {
      success: true;
      output: Z.infer<Interceptor["outputSchema"]>;
    }
  >;
};
