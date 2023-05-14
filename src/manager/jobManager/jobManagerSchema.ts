import z from "zod";

export const jobSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  point: z.enum([
    "core",
    "extension",
    "search",
    "crawler",
    "indexer",
    "pipe",
    "middleware",
  ]),
  performer: z.string(),
  logs: z.array(
    z.object({
      time: z.string(),
      text: z.string(),
    })
  ),
});

export const addJobSchema = z.object({
  name: z.string(),
  description: z.string(),
  point: z.enum([
    "core",
    "extension",
    "search",
    "crawler",
    "indexer",
    "pipe",
    "middleware",
  ]),
  performer: z.string(),
});

export const subscribeJobSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  callback: z.function(),
});

export const subscribeJobsSchema = z.object({
  id: z.string(),
  callback: z.function(),
});
