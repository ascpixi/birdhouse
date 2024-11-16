import { Express } from "express";

import { db } from "../db.js";
import { apiError, apiServerError, requireParams } from "../common.js";
import { requireSession } from "../session.js";
import { mediaExists } from "../media-manager.js";
import { resolveUser, resolveUserByHandle } from "../entity/user.js";

export function useUserEndpoints(app: Express) {
    app.get("/api/user/get/:handle", async (req, res) => {
        const user = await resolveUserByHandle(req.params.handle);
        if (user == null) {
            res.status(404).json(apiError(`Could not find an account with the handle of '${req.params.handle}'.`));
            return;
        }

        res.status(200).json({ status: "ok", ...user });
    });

    app.post("/api/user/modify", async (req, res) => {
        const uid = await requireSession(req, res);
        if (uid == null)
            return;

        const existing = await db().queryOne("SELECT * FROM bh_users WHERE id = ?", [uid]);
        if (existing === null) {
            res.status(500).json(apiError("Couldn't find the user entity for your session."));
            return;
        }

        if ("avatar" in req.body) {
            if (!mediaExists(req.body.avatar)) {
                res.status(400).json(apiError(`The avatar media URL '${req.body.avatar}' does not exist.`));
                return;
            }
        }

        if ("banner" in req.body) {
            if (!mediaExists(req.body.banner)) {
                res.status(400).json(apiError(`The banner media URL '${req.body.banner}' does not exist.`));
                return;
            }
        }

        await db().query(
            "UPDATE bh_users SET display_name = ?, bio = ?, avatar = ?, banner = ? WHERE id = ?",
            [
                typeof req.body.displayName === "string" ? req.body.displayName : existing.display_name,
                typeof req.body.bio === "string"  ? req.body.bio : existing.bio,
                typeof req.body.avatar === "string"  ? req.body.avatar : existing.avatar,
                typeof req.body.banner === "string" ? req.body.banner : existing.banner,
                uid
            ]
        );

        res.status(200).json({ status: "ok" });
    });

    app.get("/api/user/identity", async (req, res) => {
        const uid = await requireSession(req, res);
        if (uid == null)
            return;

        const user = await resolveUser(uid, uid);
        if (user == null) {
            res.status(404).json(apiError(`Could not find your account (user ID ${uid}).`));
            return;
        }

        res.status(200).json({ status: "ok", ...user });
    });

    app.post("/api/user/follow", async (req, res) => {
        const user = await requireSession(req, res);
        if (user == null)
            return;

        const params = requireParams(req, res, {
            action: "string",
            userId: "number"
        });

        if (params == null)
            return;

        if (params.action != "add" && params.action != "remove") {
            res.status(400).json(apiError(`Expected 'action' to be either 'add' or 'remove', not '${params.action}'.`));
            return;
        }

        if (params.userId == user) {
            res.status(400).json(apiError("You can't follow yourself."));
            return;
        }

        const targetUser = await resolveUser(params.userId, user);
        if (targetUser === null) {
            res.status(404).json(apiError(`Could not find a user with the ID of ${params.userId}.`));
            return;
        }

        const existing = await db().queryOne(
            "SELECT COUNT(*) AS cnt FROM bh_follows WHERE follower_id = ? AND user_id = ?",
            [user, params.userId]
        );

        if (existing === null) {
            console.error(`(err!) existing follow database query failed (${user} -> ${params.userId})`);
            res.status(500).json(apiServerError());
            return;
        }

        if (params.action === "add") {
            if (existing.cnt != 0) {
                res.status(400).json(apiError("The given follow already exists."));
                return;
            }

            await db().query("INSERT INTO bh_follows VALUES (?, ?)", [user, params.userId]);
        } else if (params.action === "remove") {
            if (existing.cnt == 0) {
                res.status(400).json(apiError("You aren't currently following that user."));
                return;
            }

            await db().query(
                "DELETE FROM bh_follows WHERE follower_id = ? AND user_id = ?",
                [user, params.userId]
            );
        }

        res.status(200).json({ status: "ok" });
    });
}