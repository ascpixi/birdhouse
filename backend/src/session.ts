import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import mysql from "mysql";

import { ExpressRequest } from "./lib.js";
import { apiError } from "./common.js";
import { db } from "./db.js";
import { UserId } from "./entity/user.js";

// After this many milliseconds, tokens should expire without being interacted with.
const TOKEN_EXPIRY = 604800 * 1000; // a week

/**
 * Creates a new token for the given user.
 */
export async function createSession(userId: UserId): Promise<string> {
    const token = uuidv4();
    await db().query(
        "INSERT INTO bh_sessions VALUES (?, ?, ?)",
        [token, userId, new Date(Date.now() + TOKEN_EXPIRY)]
    );

    return token;
}

/**
 * Gets the user ID that belongs to the session under the given token, if the session
 * in question exists and has not yet expired. 
 */
export async function verifySession(token: string): Promise<UserId | null> {
    // Invalidate all expired sessions
    await db().query("DELETE FROM bh_sessions WHERE expires < NOW()", []);

    const sessions = await db().query(
        "SELECT (user_id) FROM bh_sessions WHERE token = ?",
        [token]
    );

    if (!Array.isArray(sessions) || sessions.length == 0)
        return null;

    return sessions[0].user_id;
}

/**
 * Invalidates an existing session by its auth token. This makes the given token
 * invalid, and will not be able to be used for further authentication.
 */
export async function invalidateSession(token: string): Promise<void> {
    await db().query("DELETE FROM bh_sessions WHERE token = ?", [token]);
}

/**
 * When called from an Express endpoint, ensures the requesting user has a valid session
 * (and, thus, is registered).
 * @returns The ID of the logged-in user, or `null` if there is no valid session.
 */
export async function requireSession(req: ExpressRequest, res: Response): Promise<UserId | null> {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        res.status(401).json({
            status: "no-auth",
            message: "Not logged in."
        });
        
        return null;
    }

    const matches = /^Bearer (.+)$/.exec(auth);
    if (!matches || matches.length != 2) {
        res.status(401).json({
            status: "no-auth",
            message: "Malformed authentication token."
        });

        return null;
    }

    const token = matches[1].trim();
    const uid = await verifySession(token);
    if (uid == null) {
        res.status(401).json({
            status: "no-auth",
            message: "Invalid or expired authentication token. Please log in again."
        });

        return null;
    }

    return uid;
}

/**
 * When called from an Express endpoint, checks if the requesting user has a valid
 * session. As opposed to `requireSession`, this will send an API error to the client,
 * and thus is suitable for endpoints that are only *augmented* by user sessions, but do
 * not necessarily *require* them.
 * 
 * @returns The ID of the logged-in user, or `null` if there is no valid session.
 */
export async function peekSession(req: ExpressRequest): Promise<UserId | null> {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
        return null;

    const matches = /^Bearer (.+)$/.exec(auth);
    if (!matches || matches.length != 2)
        return null;

    const token = matches[1].trim();
    return await verifySession(token);
}

export async function mysqlAsyncConnect(sql: mysql.Connection) {
    return new Promise<void>((resolve, reject) => sql.connect(err => {
        if (err) {
            reject(err);
        }

        resolve();
    }));
}