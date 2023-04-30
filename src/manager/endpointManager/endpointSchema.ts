import z from "zod";

export const addEndpointSchema = z.object({
    name: z.string(),
    provider: z.string(),
    function: z.function(),
    forcedAssignment: z.boolean().default(false),
});