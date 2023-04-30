import type Z from "zod";
import z from "zod";

export const compareZodSchemas = (
    outputSchema: Z.ZodType<any>,
    inputSchema: Z.ZodType<any>
): boolean => {
    if (outputSchema.constructor !== inputSchema.constructor) {
        return false;
    }

    if (outputSchema instanceof z.ZodObject && inputSchema instanceof z.ZodObject) {
        const outputShape = outputSchema.shape;
        const inputShape = inputSchema.shape;

        const inputKeys = Object.keys(inputShape);

        for (const key of inputKeys) {
            if (!outputShape.hasOwnProperty(key)) {
                return false;
            }

            const outputFieldType = outputShape[key];
            const inputFieldType = inputShape[key];

            if (!compareZodSchemas(outputFieldType, inputFieldType)) {
                return false;
            }
        }
    } else if (outputSchema instanceof z.ZodArray && inputSchema instanceof z.ZodArray) {
        return compareZodSchemas(outputSchema.element, inputSchema.element);
    }

    return true;
}