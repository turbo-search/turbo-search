import { exit } from "process"
import type { ErrorType } from "./catchError.d.js"

const errorType = ["init", "available", "manifesto"]

export const catchError = (type: ErrorType, message: string[]) => {

    console.error(`Error: ${type}`)
    message.map((msg) => {
        console.error("ERROR:" + msg)
    })

    const typeIndex = errorType.indexOf(type)
    if (typeIndex == -1) {
        console.error("Unexpected error")
        exit(1);
    } else {
        exit(typeIndex + 2);
    }
}