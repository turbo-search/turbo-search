import { exit } from "process";
import type { ErrorType } from "./catchErrorType.js";

const errorType = [
  "init",
  "available",
  "manifesto",
  "dependence",
  "pipe",
  "crawler",
  "indexer",
  "adder",
  "extensionValidation",
  "taskValidation",
  "endpointValidation",
  "jobValidation",
  "jobSubscribeValidation",
  "jobsSubscribeValidation",
  "middlewareValidation",
  "pipeValidation",
  "crawlerValidation",
  "indexerValidation",
];

export const catchError = (type: ErrorType, message: string[]) => {
  console.error(`ERROR TYPE: ${type}`);
  message.map((msg) => {
    console.error("ERROR:" + msg);
  });

  const typeIndex = errorType.indexOf(type);
  if (typeIndex == -1) {
    console.error("Unexpected error");
    exit(1);
  } else {
    exit(typeIndex + 2);
  }

  exit(1);
};
