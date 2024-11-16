import { Post, resolvePost } from "./posts.js";
import { resolveUser, User, UserId } from "./user.js";

/**
 * Represents a timeline - an ordered collection of post-like entries.
 */
export interface Timeline {
    entries: TimelineEntry[];
    actors: { [userId: number]: User };
}

export type TimelineEntry =
    RawTimelineEntry |
    RepostTimelineEntry;

/**
 * A timeline entry describing a regular post.
 */
export interface RawTimelineEntry {
    kind: "raw";
    post: Post;
}

/**
 * A timeline entry describing a repost of a user - for example, for a home feed timeline,
 * this might be a post reposted by another user the target user is following, and
 * for a profile timeline, this usually is a post reposted by the user the client
 * is viewing.
 */
export interface RepostTimelineEntry {
    kind: "repost";
    post: Post;

    /** The ID of the user that created the repost this timeline entry is sourced from. */
    repostedBy: number;
}

/**
 * Pushes a `raw` entry to the given timeline, ensuring that the actor data of the
 * author of the post is present in the timeline.
 */
export async function pushPostToTimeline(post: Post, timeline: Timeline, requester: UserId | null = null) {
    if (!(post.authorId in timeline.actors)) {
        timeline.actors[post.authorId] = (await resolveUser(post.authorId, requester))!;
    }

    timeline.entries.push({
        kind: "raw",
        post: post
    });
}

/**
 * Pushes a `repost` entry to the given timeline, ensuring that the actor data of the
 * author of the reposted post is present in the timeline.
 */
export async function pushRepostToTimeline(repost: {
    post_id: number,
    user_id: number
}, timeline: Timeline, requester: UserId | null = null) {
    const reposted = await resolvePost(repost.post_id, requester);
    if (reposted == null) {
        console.warn(`(warn) post ${repost.post_id} (reposted by UID ${repost.user_id}) could not be found`);
        return;
    }

    if (!(reposted.authorId in timeline.actors)) {
        timeline.actors[reposted.authorId] = (await resolveUser(reposted.authorId, requester))!;
    }

    timeline.entries.push({
        kind: "repost",
        post: reposted,
        repostedBy: repost.user_id
    });
}

/**
 * Constructs a timeline composed of `raw` entries, which contain the given posts. The
 * order of the posts will be retained.
 */
export async function timelineFromPosts(posts: Post[], requester: UserId | null = null) {
    const timeline: Timeline = {
        actors: [],
        entries: []
    };

    for (const post of posts) {
        await pushPostToTimeline(post, timeline, requester);
    }

    return timeline;
}
