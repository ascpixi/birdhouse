import { db } from "../db.js";
import { UserId } from "./user.js";

export type PostId = number;

/**
 * Represents data auxillary to a post. Such data is almost always used in relation
 * to the post, but is not necessarily part of the post's data itself. Might vary by
 * the requesting user, as opposed to `Post` (excluding the `meta` field), which is
 * generally stateless with respect to API queries.
 */
export interface PostMeta {
    /** Whether the post was liked by the current user. Not present if not authenticated. */
    likedByUser?: boolean;

    /** Whether the post was reposted by the current user. Not present if not authenticated. */
    repostedByUser?: boolean;
}

/**
 * Represents an API representation of a post. Objects that are
 * typed as this interface may be serialized directly to JSON and
 * safely sent to clients. 
 */
export interface Post {
    /** The unique ID of the post. */
    id: PostId;

    /** The ID of the author of the post. */
    authorId: UserId;

    /**
     * The textual content of the post. Might be empty if the post is a media-only one,
     * but is never null.
     */
    textContent: string;

    /**
     * The media locator, relative to the CDN base. If null, no media was attached
     * to the post.
     */
    media: string | null;

    /**
     * The post this post is a reply to, or `null` if the post is a top-most (standalone) post.
     */
    replyTo: PostId | null;

    /** The date the post was created on. */
    createdOn: Date;

    /** The number of likes on this post. */
    likes: number;

    /** The number of reposts of this post. */
    reposts: number;

    /** The number of replies to this post. */
    replies: number;

    /** Auxillary data. Not all members of this object are guaranteed to exist. */
    meta: PostMeta;
}

/** Converts a raw database representation of a post to an API representation. */
export function unpackPost(data: any, meta: PostMeta): Post {
    return {
        id: data.id,
        authorId: data.author_id,
        textContent: data.text_content,
        media: data.media,
        createdOn: new Date(data.created_on),
        replyTo: data.reply_to,
        likes: data.num_likes,
        reposts: data.num_reposts,
        replies: data.num_replies,
        meta
    }
}

/**
 * Converts multiple raw database representations of posts to a backend representations,
 * and also creates associated `PostMeta` data.
 */ 
async function unpackMany(requester: UserId | null, results: any) {
    return Array.isArray(results)
        ? await Promise.all(
            results.map(async x => unpackPost(x, await getPostMeta(x.id, requester)))
        )
    : [];
}

export async function getPostMeta(id: PostId, requester: UserId | null = null): Promise<PostMeta> {
    if (requester == null)
        return {};

    const query = "SELECT * FROM bh_interactions WHERE user_id = ? AND post_id = ? AND kind = ?";

    return {
        likedByUser: await db().queryOne(query, [requester, id, "like"]) != null,
        repostedByUser: await db().queryOne(query, [requester, id, "repost"]) != null
    };
}

export async function resolvePost(id: PostId, requester: UserId | null = null): Promise<Post | null> {
    if (typeof id !== "number")
        throw new TypeError(`for id: expected a number, not a ${typeof id}`);

    const res = await db().queryOne("SELECT * FROM bh_posts WHERE id = ?", [id]);
    return res !== null ? unpackPost(res, await getPostMeta(id, requester)) : null;
}

export async function getPostsBy(authorId: UserId, withReplies = true, requester: UserId | null = null): Promise<Post[]> {
    if (typeof authorId !== "number")
        throw new TypeError(`for authorId: expected a number, not a ${typeof authorId}`);

    return await unpackMany(requester, await db().query(
        withReplies
            ? "SELECT * FROM bh_posts WHERE author_id = ? ORDER BY created_on DESC"
            : "SELECT * FROM bh_posts WHERE author_id = ? AND reply_to IS NULL ORDER BY created_on DESC",
        [authorId]
    ));
}

export async function getRecentPosts(requester: UserId | null = null, limit = 50): Promise<Post[]> {
    return await unpackMany(requester, await db().query(
        "SELECT * FROM bh_posts ORDER BY created_on DESC LIMIT ?",
        [limit]
    ));
}

export async function getRepliesTo(postId: PostId, requester: UserId | null = null, limit = 50): Promise<Post[]> {
    return await unpackMany(requester, await db().query(
        "SELECT * FROM bh_posts WHERE reply_to = ? ORDER BY num_likes DESC LIMIT ?",
        [postId, limit]
    ));
}

export async function createPost(
    author: UserId,
    text: string | null,
    media: string | null,
    replyTo: PostId | null
): Promise<PostId> {
    if (typeof author !== "number")
        throw new TypeError(`for author: expected a number, not a ${typeof author}`);

    text ??= "";

    const results = await db().query(
        "INSERT INTO bh_posts VALUES (DEFAULT, ?, ?, ?, CURRENT_TIMESTAMP(), ?, 0, 0, 0)",
        [author, text, media, replyTo]
    );

    if (replyTo != null) {
        await db().query("UPDATE bh_posts SET num_replies = num_replies + 1 WHERE id = ?", [replyTo]);
    }

    return results.insertId;
}
