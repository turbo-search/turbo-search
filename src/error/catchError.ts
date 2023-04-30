import type { ErrorType } from "./catchErrorType.js";

export function catchError(type: ErrorType, message: string[]): never {
  console.error(`ERROR TYPE: ${type}`);
  message.map((msg) => {
    console.error("ERROR:" + msg);
  });

  return process.exit(-1);
};
