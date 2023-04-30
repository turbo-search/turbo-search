import { TurboSearchKit } from "../../indexType";

export type ExtensionManifesto = {
  name: string;
  dependence?: { [extensionName: string]: string };
  coreDependence?: string;
  version: string;
};

export type Extension = {
  init?: (turboSearchKit?: TurboSearchKit) => void;
  available?: () => { success: false; message: string } | { success: true };
  manifesto: ExtensionManifesto;
};
