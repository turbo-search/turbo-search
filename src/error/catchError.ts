export type ErrorType =
  | "init"
  | "available"
  | "manifesto"
  | "dependence"
  | "pipe"
  | "crawler"
  | "indexer"
  | "inserter"
  | "searcher"
  | "database"
  | "endpoint"
  | "extensionValidation"
  | "taskValidation"
  | "endpointValidation"
  | "jobValidation"
  | "jobSubscribeValidation"
  | "jobsSubscribeValidation"
  | "middlewareValidation"
  | "pipeValidation"
  | "crawlerValidation"
  | "indexerValidation"
  | "databaseValidation"
  | "rankerValidation"
  | "interceptorValidation";


export function catchError(type: ErrorType, message: string[]): never {
  console.error(`ERROR TYPE: ${type}`);
  message.map((msg) => {
    console.error("ERROR:" + msg);
  });

  return process.exit(-1);
}
