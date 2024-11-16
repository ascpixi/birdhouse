import fs from "fs";
import path from "path";
import { object, string, number, InferType } from 'yup';
import { env } from "./common.js";

let backendConfigSchema = object({
    port: number().default(3000),
    frontendUrl: string().required(),
    backendUrl: string().required(),
    userContentPath: string().required(),
    staticContentPath: string().required(),
    staticContent: object({
        defaultAvatar: string().required(),
        defaultBanner: string().required()
    }).required()
});

type BackendConfig = InferType<typeof backendConfigSchema>;

let _config: BackendConfig | null = null;

/**
 * Loads the backend config, exposing it via the `cfg()` function.
 */
export async function loadBackendConfig() {
    const file = await fs.promises.readFile(env("BIRDHOUSE_CFG"));
    const raw = JSON.parse(file.toString("utf-8"));
    _config = await backendConfigSchema.validate(raw);

    console.log(`(info) config reloaded from ${env("BIRDHOUSE_CFG")}`);
}

export function cfg() {
    if (_config == null)
        throw new Error("Attempted to access the backend config before it was loaded.");

    return _config;
}

/**
 * Converts a path relative to the backend configuration path to an absolute one.
 */
export function cfgRelPath(target: string) {
    return path.join(path.dirname(env("BIRDHOUSE_CFG")), target);
}
