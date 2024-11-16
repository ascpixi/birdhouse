import { apiFetchOptions, ApiResponse, returnApiResponse } from "./common";
import { Timeline } from "./timeline";
import { ApiUser } from "./user";

const apiUrl = import.meta.env.VITE_BIRDHOUSE_API_URL;

/**
 * Represents data auxillary to the post. Such data is almost always used in relation
 * to the post, but is not necessarily part of the post's data itself. Might vary by
 * the requesting user, as opposed to `Post` (excluding the `meta` field), which are
 * generally stateless with respect to API queries.
 */
export interface PostMeta {
    /** Whether the post was liked by the current user. Not present if not authenticated. */
    likedByUser?: boolean;

    /** Whether the post was reposted by the current user. Not present if not authenticated. */
    repostedByUser?: boolean;
}

/**
 * Represents an API representation of a post, as received over JSON.
 */
export interface ApiPost {
    /** The unique ID of the post. */
    id: number;

    /** The ID of the author of the post. */
    authorId: number;

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

    /** The post this post is a reply to, or `null` if the post is a top-most (standalone) post. */
    replyTo: number | null;

    /** The date the post was created on. */
    createdOn: string;

    /** The number of likes on this post. */
    likes: number;

    /** The number of reposts of this post. */
    reposts: number;

    /** The number of replies to this post. */
    replies: number;

    /** Auxillary data. Not all members of this object are guaranteed to exist. */
    meta: PostMeta;
}

/**
 * Gets a post by its ID. 
 */
export async function get(id: number): ApiResponse<{
    post: ApiPost,
    author: ApiUser
}> {
    const resp = await fetch(`${apiUrl}/posts/get/${id}`, {
        ...apiFetchOptions("GET")
    });

    return returnApiResponse(resp, "/posts/get");
}

/**
 * Represents a post that has not yet been authored (created).
 */
export interface PostManifest {
    text?: string;
    media?: string;
    replyTo?: number;
}

/**
 * Authors a post on behalf of the currently logged-in user.
 */
export async function create(manifest: PostManifest): ApiResponse<{
    createdId: number
}> {
    const resp = await fetch(`${apiUrl}/posts/create`, {
        body: JSON.stringify(manifest),
        ...apiFetchOptions("POST")
    });

    return returnApiResponse(resp, "/posts/create");
}

export type InteractionKind = "like" | "repost";

/**
 * Adds or removes an interaction on a post.
 */
export async function interact(kind: InteractionKind, postId: number, action: "add" | "remove"): ApiResponse<{}> {
    const resp = await fetch(`${apiUrl}/posts/interact`, {
        body: JSON.stringify({ kind, postId, action }),
        ...apiFetchOptions("POST")
    });

    return returnApiResponse(resp, "/posts/interact");
}

/**
 * Gets posts created by the given user.
 */
export async function byUser(id: number): ApiResponse<{
    posts: ApiPost[]
}> {
    const resp = await fetch(`${apiUrl}/posts/by_user/${id}`, apiFetchOptions("GET"));
    return returnApiResponse(resp, "/posts/by_user");
}

/**
 * Gets a post, its author, and the replies to said post, forming a thread.
 */
export async function thread(id: number): ApiResponse<{
    parentPost: ApiPost | null,
    parentAuthor: ApiUser | null,
    post: ApiPost,
    author: ApiUser,
    replyTimeline: Timeline
}> {
    const resp = await fetch(`${apiUrl}/posts/thread/${id}`, apiFetchOptions("GET"));
    return returnApiResponse(resp, "/posts/thread");
}
