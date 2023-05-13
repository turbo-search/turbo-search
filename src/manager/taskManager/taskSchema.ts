import z from "zod";

export const taskSchema = z.object({
  name: z.string(),
  provider: z.string(),
  function: z.function(),
  forcedAssignment: z.boolean().default(false),
});
