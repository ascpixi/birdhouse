import { apiFetchOptions, ApiResponse, returnApiResponse } from "./common";
import { ApiPost } from "./posts";
import { ApiUser } from "./user";

const apiUrl = import.meta.env.VITE_BIRDHOUSE_API_URL;

/**
 * Represents a timeline - an ordered collection of post-like entries.
 */
export interface Timeline {
    entries: TimelineEntry[];
    actors: { [userId: number]: ApiUser };
}

export type TimelineEntry =
    RawTimelineEntry |
    RepostTimelineEntry;

/**
 * A timeline entry describing a regular post.
 */
export interface RawTimelineEntry {
    kind: "raw";
    post: ApiPost;
}

/**
 * A timeline entry describing a repost of a user - for example, for a home feed timeline,
 * this might be a post reposted by another user the target user is following, and
 * for a profile timeline, this usually is a post reposted by the user the client
 * is viewing.
 */
export interface RepostTimelineEntry {
    kind: "repost";
    post: ApiPost;

    /** The ID of the user that created the repost this timeline entry is sourced from. */
    repostedBy: number;
}

/**
 * Gets the timeline for a user profile, highlighting only posts created and/or
 * reposted by the user.
 */
export async function user(id: number): ApiResponse<Timeline> {
    const resp = await fetch(`${apiUrl}/timeline/user/${id}`, apiFetchOptions("GET"));
    return returnApiResponse(resp, "/timeline/user");
}

/**
 * Gets the timeline of the client's home (For You) page. If the client is logged in,
 * the timeline may also be personalized.
 */
export async function home(page: number): ApiResponse<Timeline> {
    const resp = await fetch(`${apiUrl}/timeline/home/${page}`, apiFetchOptions("GET"));
    return returnApiResponse(resp, "/timeline/home");
}

