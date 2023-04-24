import z from "zod";

export const addTaskSchema = z.object({
    name: z.string(),
    provider: z.string(),
    function: z.function(),
    forcedAssignment: z.boolean().default(false),
});