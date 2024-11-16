import { Response } from "express";
import { ExpressRequest } from "./lib.js";
import { object, ObjectSchema } from "yup";

export function apiError(error: string) {
    return {
        status: "error",
        error: error
    };
}

export function apiServerError() {
    return {
        status: "error",
        error: "An internal server error has occured while processing the request. Please try again later."
    }
}

// https://stackoverflow.com/a/6229124
export function prettifyHandle(str: string){
    return str
        // insert a space between lower & upper
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // space before last upper in a sequence followed by lower
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        // uppercase the first character
        .replace(/^./, (str) => str.toUpperCase())
}

export function env(key: string): string {
    if (process.env[key] == undefined) {
        console.log(`error: required environment variable ${key} is not set`);
        process.exit(1);
    }

    return process.env[key]!;
}

export function envOptional(key: string): string | undefined {
    return process.env[key];
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type ParamTypeof = "string" | "number" | "boolean" | "object";

type TypeMapping = {
    'string': string;
    'number': number;
    'boolean': boolean;
    'object': object;
}

type ParamsFromSchema<T extends { [key: string]: keyof TypeMapping }> = {
    [K in keyof T]: TypeMapping[T[K]]
}

export function requireParams<T extends { [key: string]: ParamTypeof }>(
    req: ExpressRequest, 
    res: Response, 
    schema: T
): ParamsFromSchema<T> | null {
    const map = {};

    for (const [name, type] of Object.entries(schema)) {
        const val = req.body[name];
        if (val === undefined) {
            res.status(400).json(apiError(`The required parameter '${name}' was not provided.`));
            return null;
        }
    
        if (typeof val !== type) {
            res.status(400).json(apiError(`The parameter ${name} was of an invalid type (expected a ${type}, not a ${typeof val}).`));
            return null;
        }

        map[name] = val;
    }

    return map as ParamsFromSchema<T>;
}
