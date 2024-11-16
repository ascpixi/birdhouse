import fs from "fs";
import path from "path";
import express, { Express } from "express";

import { apiError } from "../common.js";
import { uploadMedia } from "../media-manager.js";
import { requireSession } from "../session.js";

const rawBodyMiddleware = express.raw({
    type: 'application/octet-stream',
    limit: '25mb',
});

export function useMediaEndpoints(app: Express) {
    app.post("/api/media/upload", rawBodyMiddleware, async (req, res) => {
        await requireSession(req, res);

        if (!req.body || !(req.body instanceof Buffer)) {
            res.status(400).json(apiError("No file data received."));
            return;
        }

        const result = await uploadMedia(req.body);
        if (result.ok === true) {
            res.status(201).json({
                status: "ok",
                url: result.value
            });
        } else {
            res.status(400).json(apiError(result.error));
        }
    });
}