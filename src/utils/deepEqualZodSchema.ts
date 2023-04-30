import { z } from "zod";

export const deepEqualZodSchema = (
    outputSchema: z.ZodType<any>,
    inputSchema: z.ZodType<any>
): boolean => {
    if (outputSchema.constructor !== inputSchema.constructor) {
        return false;
    }

    if (outputSchema instanceof z.ZodObject && inputSchema instanceof z.ZodObject) {
        const outputShape = outputSchema.shape;
        const inputShape = inputSchema.shape;

        const outputKeys = Object.keys(outputShape);
        const inputKeys = Object.keys(inputShape);

        if (outputKeys.length !== inputKeys.length) {
            return false;
        }

        for (const key of inputKeys) {
            if (!outputShape.hasOwnProperty(key)) {
                return false;
            }

            const outputFieldType = outputShape[key];
            const inputFieldType = inputShape[key];

            if (!deepEqualZodSchema(outputFieldType, inputFieldType)) {
                return false;
            }
        }
    } else if (outputSchema instanceof z.ZodArray && inputSchema instanceof z.ZodArray) {
        return deepEqualZodSchema(outputSchema.element, inputSchema.element);
    }

    return true;
}