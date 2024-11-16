import { apiFetchOptions, ApiResponse, failedRequest } from "./common";

const apiUrl = import.meta.env.VITE_BIRDHOUSE_API_URL;

/**
 * Represents data auxillary to a user. Such data is almost always used in relation
 * to the user, but is not necessarily part of the user's data itself. Might vary by
 * the requesting user, as opposed to `User` (excluding the `meta` field), which is
 * generally stateless with respect to API queries.
 */
export interface UserMeta {
    /** Whether this user was followed by the requesting user. Not present if not authenticated. */
    followedByUser?: boolean;

    /** If `true`, the user entity is equal to the requesting user. */
    isRequester?: boolean;
}

/**
 * Represents an API representation of a user, as received over JSON.
 */
export interface ApiUser {
    /** The unique ID of the user. */
    id: number;

    /** The handle of the user - that is, their unique username. Does not include the `@` symbol. */
    handle: string;

    /**
     * The display name of the user. The user can freely change their display name and
     * there can be multiple users with the same display name.
     */
    displayName: string;

    /** A user-provided description of their account. */
    bio: string;

    /** The time at which the user created their account. */
    createdOn: string;

    /** A media URL pointing to the avatar (profile picture) of the user. */
    avatar: string;

    /** A media URL pointing to the banner of the user, which is displayed on their profile page. */
    banner: string;

    /** The number of accounts that follow this user. Derived from foreign tables. */
    followers: number;

    /** The number of accounts that this user follows. Derived from foreign tables. */
    following: number;

    /** Auxillary data. Not all members of this object are guaranteed to exist. */
    meta: UserMeta;
}

/**
 * Gets a user by their handle. 
 */
export async function get(handle: string): ApiResponse<ApiUser> {
    const resp = await fetch(`${apiUrl}/user/get/${encodeURIComponent(handle)}`, {
        ...apiFetchOptions("GET")
    });

    const json = await resp.json();
    if (!resp.ok || json.status !== "ok")
        return failedRequest("/user/get", json, resp);

    return json;
}

export interface UserMutation {
    displayName?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
}

/**
 * Modifies select data of the user.
 */
export async function modify(mutation: UserMutation): ApiResponse<{}> {
    const resp = await fetch(`${apiUrl}/user/modify`, {
        body: JSON.stringify(mutation),
        ...apiFetchOptions("POST")
    });

    const json = await resp.json();
    if (!resp.ok || json.status !== "ok")
        return failedRequest("/user/modify", json, resp);

    return json;
}

/**
 * Gets data about the currently logged in user.
 */
export async function identity(): ApiResponse<ApiUser> {
    const resp = await fetch(`${apiUrl}/user/identity`, apiFetchOptions("GET"));

    const json = await resp.json();
    if (!resp.ok || json.status !== "ok")
        return failedRequest("/user/identity", json, resp);

    return json;
}

/**
 * Follows (or unfollows) the given user.
 */
export async function follow(action: "add" | "remove", userId: number): ApiResponse<{}> {
    const resp = await fetch(`${apiUrl}/user/follow`, {
        body: JSON.stringify({ action, userId }),
        ...apiFetchOptions("POST")
    });

    const json = await resp.json();
    if (!resp.ok || json.status !== "ok")
        return failedRequest("/user/follow", json, resp);

    return json;
}