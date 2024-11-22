import bcrypt from "bcrypt";
import { Express } from "express";

import { db } from "../db.js";
import { createSession, invalidateSession, verifySession } from "../session.js";
import { apiError, prettifyHandle, requireParams } from "../common.js";
import { cfg } from "../config.js";
import { getAbsoluteMediaUrl } from "../media-manager.js";

const SALT_ROUNDS = 10;

function verifyPasswordStrength(password: string) {
    return password.length >= 6;
}

export function useAuthEndpoints(app: Express) {
    app.post("/api/auth/login", async (req, res) => {
        const params = requireParams(req, res, {
            handle: "string",
            pwd: "string"
        });

        if (params === null)
            return;

        const pwd = atob(params.pwd);

        const user = await db().queryOne(
            "SELECT id, pwd_hash FROM bh_users WHERE handle = ?",
            [params.handle]
        );

        if (user === null) {
            res.status(400).json(apiError("Incorrect handle."));
            return;
        }

        if (!await bcrypt.compare(pwd, user.pwd_hash)) {
            res.status(400).json(apiError("Incorrect password."));
            return;
        }

        const token = await createSession(user.id);
        res.status(200).json({ status: "ok", token: token });
    });

    app.post("/api/auth/register", async (req, res) => {
        const params = requireParams(req, res, {
            handle: "string",
            pwd: "string"
        });

        if (params === null)
            return;

        if (!verifyPasswordStrength(atob(params.pwd))) {
            res.status(400).json(apiError("Your password is too weak."));
            return;
        }

        if (!/^[A-Za-z_.0-9]{3,24}$/.test(params.handle)) {
            res.status(400).json(apiError("Invalid handle. Ensure it only has alphanumeric characters, underscores, and periods, is longer than 3 characters, and shorter than 24 characters."));
            return 
        }

        const pwdHash = await bcrypt.hash(atob(params.pwd), SALT_ROUNDS);

        const duplicateHandles = await db().queryOne(
            "SELECT COUNT(*) AS cnt FROM bh_users WHERE handle = ?",
            [params.handle]
        );

        if (duplicateHandles != null && duplicateHandles.cnt > 0) {
            res.status(400).json(apiError("Another user already has that handle. Please try another."));
            return;
        }

        const results = await db().query(
            "INSERT INTO bh_users VALUES (NULL, ?, ?, ?, ?, ?, NOW(), ?)",
            [
                params.handle,
                prettifyHandle(params.handle),
                "No bio set.",
                getAbsoluteMediaUrl(`static/${cfg().staticContent.defaultBanner}`),
                getAbsoluteMediaUrl(`static/${cfg().staticContent.defaultAvatar}`),
                pwdHash
            ]
        );

        const token = await createSession(results.insertId);
        res.status(201).json({ status: "ok", token: token });
    });

    app.post("/api/auth/invalidate", async (req, res) => {
        const params = requireParams(req, res, {
            token: "string"
        });
    
        if (params == null)
            return;

        if (await verifySession(params.token) == null) {
            res.status(400).json(apiError("The given token either doesn't exist, or has expired."));
            return;
        }

        await invalidateSession(params.token);
        res.status(200).json({ status: "ok" });
    });
}
