import { Request, Response } from "express";

interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export type ExpressRequest = Request<{}, any, any, ParsedQs, Record<string, any>>;
