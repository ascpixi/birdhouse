import { Database, Deferred, db } from "../db.js";

/**
 * An alias representing a user ID.
 */
export type UserId = number;

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
 * Represents an API representation of a user. Objects that are
 * typed as this interface may be serialized directly to JSON and
 * safely sent to clients. 
 */
export interface User {
    /** The unique ID of the user. */
    id: UserId;

    /** The handle of the user - that is, their unique username. Does not include the `@` symbol. */
    handle: string;

    /**
     * The display name of the user. The user can freely change their display name and
     * there can be multiple users with the same display name.
     */
    displayName: string;

    /** A user-provided description of their account. */
    bio: string;

    /** A media URL pointing to the avatar (profile picture) of the user. */
    avatar: string;

    /** A media URL pointing to the banner of the user, which is displayed on their profile page. */
    banner: string;

    /** The time at which the user created their account. */
    createdOn: Date;

    /** The number of accounts that follow this user. Derived from foreign tables. */
    followers: number;

    /** The number of accounts that this user follows. Derived from foreign tables. */
    following: number;

    /** Auxillary data. Not all members of this object are guaranteed to exist. */
    meta: UserMeta;
}

async function resolveUserBy(
    columnName: string,
    compareTo: any,
    requester: UserId | null
): Promise<User | null> {
    const data = await db().queryOne(`SELECT * FROM bh_users WHERE ${columnName} = ?`, [compareTo]);
    if (data === null)
        return null;

    const userId = data.id;

    let followerCount = 0;
    const followerCountQuery = await db().queryOne(
        "SELECT COUNT(*) AS x FROM bh_follows WHERE user_id = ?", [userId]
    );

    if (followerCountQuery === null) {
        console.warn(`(warn) could not get follower count for user ${userId} (@${data.handle})`);
        followerCount = 0;
    } else {
        followerCount = followerCountQuery.x;
    }

    let followingCount = 0;
    const followingCountQuery = await db().queryOne(
        "SELECT COUNT(*) AS x FROM bh_follows WHERE follower_id = ?", [userId]
    );

    if (followingCountQuery === null) {
        console.warn(`(warn) could not get following count for user ${userId} (@${data.handle})`);
        followingCount = 0;
    } else {
        followingCount = followingCountQuery.x;
    }

    return {
        id: data.id,
        handle: data.handle,
        displayName: data.display_name,
        bio: data.bio,
        createdOn: new Date(data.created_on),
        avatar: data.avatar,
        banner: data.banner,
        followers: followerCount,
        following: followingCount,
        meta: await getUserMeta(userId, requester)
    }
}

/**
 * Gets the data about a user, identified by their user ID.
 */
export async function resolveUser(userId: UserId, requester: UserId | null = null): Promise<User | null> {
    if (typeof userId !== "number")
        throw new TypeError(`for userId: expected a number, not a ${typeof userId}`);

    return await resolveUserBy("id", userId, requester);
}

/**
 * Gets the data about a user, identified by their unique handle.
 */
export async function resolveUserByHandle(handle: string, requester: UserId | null = null): Promise<User | null> {
    if (typeof handle !== "string")
        throw new TypeError(`for handle: expected a string, not a ${typeof handle}`);

    return await resolveUserBy("handle", handle, requester);
}

export async function getUserMeta(id: UserId, requester: UserId | null = null): Promise<UserMeta> {
    if (requester == null)
        return {};

    return {
        isRequester: id == requester,
        followedByUser: (await db().queryOne(
            "SELECT COUNT(*) AS cnt FROM bh_follows WHERE follower_id = ? AND user_id = ?",
            [requester, id]
        ))?.cnt == 1,
    };
}

export async function getFollowedUsers(userId: UserId): Promise<UserId[]> {
    const results = await db().query(
        "SELECT user_id FROM bh_follows WHERE follower_id = ?",
        [userId]
    );

    return Array.isArray(results) ? results.map(x => x.user_id) : [];
}

export async function getFollowers(userId: UserId): Promise<UserId[]> {
    if (typeof userId !== "number")
        throw new TypeError(`for userId: expected a number, not a ${typeof userId}`);

    const results = await db().query(
        "SELECT follower_id FROM bh_follows WHERE user_id = ?",
        [userId]
    );

    return Array.isArray(results) ? results.map(x => x.follower_id) : [];
}
