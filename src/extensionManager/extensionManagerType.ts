import { Extension, TurboSearchKit } from "../indexType";

export type ExtensionManager = {

  //extensionのバリデーション
  validate: () => void;

  //同じ名前の拡張機能がないかどうかチェック
  checkDuplicateExtensionName: () => void;

  //check extensions manifesto
  checkManifesto: () => void;

  //extensions available check
  checkAvailable: () => void;

  //dependencies check
  checkDependence: () => void;

  //extensions loader & add task , endpoint
  load: (turboSearchKit: TurboSearchKit) => void;

  //get extensions
  getExtensions: () => Extension[];

  //setup extensions
  setupExtensions: () => Extension[];
};
