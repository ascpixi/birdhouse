import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

import { cfg, cfgRelPath } from "./config.js";
import { Result } from "./common.js";

// https://stackoverflow.com/a/1349426/13153269
function generateId(length: number) {
    let result = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result;
}

const allowedMediaTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",

    "video/mp4",
    "video/mpeg",
    "video/x-matroska"
];

/**
 * Uploads a file as a media entry. If the operation fails, returns
 * an erronous `Result` - otherwise, the `Result` holds the URL which
 * points to the media entry. This URL always begins with a `/`, making
 * it relative to the website root.
 */
export async function uploadMedia(data: Buffer): Promise<Result<string, string>> {
    let type = await fileTypeFromBuffer(data);
    if (type == undefined || !allowedMediaTypes.includes(type.mime)) {
        return { ok: false, error: "Unrecognized media type." };
    }

    let filename = `${generateId(16)}.${type.ext}`;
    let root = cfgRelPath(cfg().userContentPath);
    if (!fs.existsSync(root)) {
        console.log(`(info) user content directory @ ${root} doesn't exist - creating it`);
        await fs.promises.mkdir(root);
    }

    await fs.promises.writeFile(path.join(root, filename), data);

    console.log(`(info) media uploaded: ${filename}, ${(data.byteLength / 1024 / 1024).toFixed(2)} MiB`);

    return { ok: true, value: getAbsoluteMediaUrl(`user-content/${filename}`) }
}

export function getAbsoluteMediaUrl(url: string) {
    return `${cfg().backendUrl}/${url}`
}

/**
 * Checks if a given user content media file exists.
 */
export function mediaExists(url: string) {
    const prefix = `${cfg().backendUrl}/user-content/`;

    return !url.startsWith(prefix)
        ? false
        : fs.existsSync(
            path.join(
                cfgRelPath(cfg().userContentPath),
                url.substring(prefix.length)
            )
        );
}