import { Express } from "express";

import { createPost, getPostsBy, getRepliesTo, resolvePost } from "../entity/posts.js";
import { apiError, requireParams } from "../common.js";
import { mediaExists } from "../media-manager.js";
import { peekSession, requireSession } from "../session.js";
import { resolveUser } from "../entity/user.js";
import { db } from "../db.js";
import { timelineFromPosts } from "../entity/timeline.js";

const MAX_POST_LENGTH = 280;

export function usePostsEndpoints(app: Express) {
    app.get("/api/posts/get/:id", async (req, res) => {
        let requester = await peekSession(req);

        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json(apiError(`The given ID '${req.params.id}' is not a valid integer.`));
            return;
        }

        const post = await resolvePost(id, requester);
        if (post == null) {
            res.status(404).json(apiError("No such post."));
            return;
        }

        res.status(200).json({
            status: "ok",
            post: post,
            author: await resolveUser(post.authorId, requester)
        });
    });

    app.post("/api/posts/create", async (req, res) => {
        let user = await requireSession(req, res);
        if (user == null)
            return;

        const text = req.body.text;
        const media = req.body.media;
        const replyTo = req.body.replyTo;

        if (!text && !media) {
            res.status(400).json(apiError("Expected either media, text, or both."));
            return;
        }

        if (text) {
            if (typeof text !== "string") {
                res.status(400).json(apiError(`The 'text' field must be a string, not a ${typeof text}.`));
                return;
            }

            if (text.length > MAX_POST_LENGTH) {
                res.status(400).json(apiError(`A post can have at most ${MAX_POST_LENGTH} characters.`))
                return;
            }
        }

        if (media) {
            if (typeof media !== "string") {
                res.status(400).json(apiError(`The 'media' field must be a string, not a ${typeof media}.`));
                return;
            }

            if (!mediaExists(media)) {
                res.status(404).json(apiError(`The media '${media}' couldn't be found.`));
                return;
            } 
        }

        if (replyTo || replyTo == 0) {
            if (typeof replyTo !== "number") {
                res.status(400).json(apiError(`The 'replyTo' field must be a number, not a ${typeof replyTo}.`));
                return;
            }

            // TODO: This can probably be optimized but I can't be bothered
            if (await resolvePost(replyTo) == null) {
                res.status(404).json(apiError("The post you are replying to doesn't exist."));
                return;
            }
        }

        const id = await createPost(user, text, media, replyTo);
        res.status(200).json({
            status: "ok",
            createdId: id
        });
    });

    app.post("/api/posts/interact", async (req, res) => {
        const user = await requireSession(req, res);
        if (user == null)
            return;

        const params = requireParams(req, res, {
            kind: "string",
            postId: "number",
            action: "string"
        });

        if (params === null)
            return;

        if (!["like", "repost"].includes(params.kind)) {
            res.status(400).json(apiError(`The 'kind' parameter must be either 'like' or 'repost', not '${params.kind}'.`));
            return;
        }

        if (await resolvePost(params.postId) == null) {
            res.status(404).json(apiError(`The post with the ID of ${params.postId} couldn't be found. It could be deleted.`));
            return;
        }

        const existing = await db().queryOne(
            "SELECT * FROM bh_interactions WHERE user_id = ? AND post_id = ? AND kind = ?",
            [user, params.postId, params.kind]
        );

        if (params.action === "add") {
            if (existing !== null) {
                res.status(409).json(apiError(`The ${params.kind} already exists.`));
                return;
            }
    
            await db().asTransaction(async () => {
                await db().query(
                    "INSERT INTO bh_interactions VALUES (?, ?, ?, NOW())",
                    [user, params.postId, params.kind]
                );
    
                let columnName = params.kind === "like" ? "num_likes" : "num_reposts";
                await db().query(
                    `UPDATE bh_posts SET ${columnName} = ${columnName} + 1 WHERE id = ?`,
                    [params.postId]
                );
            });
    
            res.status(200).json({ status: "ok" });
        } else if (params.action === "remove") {
            if (existing === null) {
                res.status(404).json(apiError(`The given ${params.kind} doesn't exist.`));
                return;
            }

            await db().asTransaction(async () => {
                await db().query(
                    "DELETE FROM bh_interactions WHERE user_id = ? AND post_id = ? AND kind = ?",
                    [user, params.postId, params.kind]
                );
    
                let columnName = params.kind === "like" ? "num_likes" : "num_reposts";
                await db().query(
                    `UPDATE bh_posts SET ${columnName} = ${columnName} - 1 WHERE id = ?`,
                    [params.postId]
                );
            });

            res.status(200).json({ status: "ok" });
        } else {
            res.status(400).json(apiError("Expected 'action' to be either 'add' or 'remove'."));
        }
    });

    app.get("/api/posts/by_user/:id", async (req, res) => {
        let requester = await peekSession(req);

        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json(apiError(`The given ID '${req.params.id}' is not a valid integer.`));
            return;
        }

        const targetUser = await resolveUser(id, requester);
        if (targetUser == null) {
            res.status(404).json(apiError("The given user doesn't exist."));
            return;
        }

        const posts = await getPostsBy(targetUser.id, true, requester);
        res.status(200).json({
            status: "ok",
            posts: posts
        });
    });

    app.get("/api/posts/thread/:id", async (req, res) => {
        let requester = await peekSession(req);
        
        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json(apiError(`The given ID '${req.params.id}' is not a valid integer.`));
            return;
        }

        const targetPost = await resolvePost(id, requester);
        if (targetPost == null) {
            res.status(404).json(apiError("The given post doesn't exist."));
            return;
        }

        const postAuthor = await resolveUser(targetPost.authorId, requester);
        const posts = await getRepliesTo(id, requester);

        const hasParent = targetPost.replyTo != null;

        const parentPost = !hasParent ? null : await resolvePost(targetPost.replyTo!, requester);
        const parentAuthor = !hasParent ? null : await resolveUser(parentPost!.authorId, requester);

        res.status(200).json({
            status: "ok",
            parentPost: parentPost,
            parentAuthor: parentAuthor,
            post: targetPost,
            author: postAuthor,
            replyTimeline: await timelineFromPosts(posts, requester)
        });
    });
}