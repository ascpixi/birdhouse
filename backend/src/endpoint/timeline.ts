import { Express } from "express";

import { getPostMeta, getPostsBy, unpackPost } from "../entity/posts.js";
import { apiError } from "../common.js";
import { peekSession } from "../session.js";
import { resolveUser } from "../entity/user.js";
import { db } from "../db.js";
import { pushPostToTimeline, pushRepostToTimeline, Timeline } from "../entity/timeline.js";

export function useTimelineEndpoints(app: Express) {
    app.get("/api/timeline/user/:id", async (req, res) => {
        let requester = await peekSession(req);

        let id = parseInt(req.params.id);
        if (isNaN(id) || id < 0) {
            res.status(400).json(apiError(`The given ID '${req.params.id}' is not a valid positive integer.`));
            return;
        }

        const targetUser = await resolveUser(id, requester);
        if (targetUser == null) {
            res.status(404).json(apiError("The given user doesn't exist."));
            return;
        }

        const timeline: Timeline = {
            entries: [],
            actors: {}
        };

        const reposts: any[] = await db().query(
            "SELECT * FROM bh_interactions WHERE user_id = ? AND kind = 'repost' ORDER BY created_on DESC",
            [id]
        );

        const posts = await getPostsBy(targetUser.id, false, requester);

        while (reposts.length != 0 && posts.length != 0) {
            if (reposts[0].created_on > posts[0].createdOn) {
                await pushRepostToTimeline(reposts.shift()!, timeline, requester);
            } else {
                await pushPostToTimeline(posts.shift()!, timeline, requester);
            }
        }

        for (const post of posts) {
            await pushPostToTimeline(post, timeline, requester);
        }

        for (const repost of reposts) {
            await pushRepostToTimeline(repost, timeline, requester);
        }

        if (!(id in timeline.actors)) {
            timeline.actors[id] = (await resolveUser(id, requester))!;
        }

        res.status(200).json({
            status: "ok",
            ...timeline
        });
    });

    app.get("/api/timeline/home/:page", async (req, res) => {
        let requester = await peekSession(req);

        let page = parseInt(req.params.page);
        if (isNaN(page) || page < 0) {
            res.status(400).json(apiError(`The given page '${req.params.page}' is not a valid positive integer.`));
            return;
        }

        const timeline: Timeline = {
            entries: [],
            actors: {}
        };

        // TODO: Implement a more complex For You timeline algorithm
        const latest = await db().query(
            "SELECT * FROM bh_posts ORDER BY created_on DESC LIMIT 50 OFFSET ?",
            [page * 50]
        );

        for (const dbPost of latest) {
            const post = unpackPost(dbPost, await getPostMeta(dbPost.id, requester));
            timeline.entries.push({ kind: "raw", post });

            if (!(post.authorId in timeline.actors)) {
                timeline.actors[post.authorId] = (await resolveUser(post.authorId, requester))!;
            }
        }

        res.status(200).json({
            status: "ok",
            ...timeline
        });
    });
}