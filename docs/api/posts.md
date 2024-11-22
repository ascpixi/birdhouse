# `/api/posts` HTTP API endpoint group
The `/api/posts` endpoint of the Birdhouse HTTP API serves to create, fetch, and interact with user-created posts.

## GET `/api/posts/:id`
Fetches a post with the given ID. The ID of the post is provided directly as an URL suffix, replacing the `:id` placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    post: ApiPost;
    author: ApiUser;
}
```

## POST `/api/posts/create`
Creates a new user post. Either the `text` or `media` fields must be present in the request body.

**Authentication:** required

### Parameter JSON schema
```ts
interface {
    // The text content of the post to create. If `media` is specified, this may be
    // `undefined` (or not present) to create a media-only post.
    text?: string;

    // A URL returned by an `/api/media` endpoint to use as the media. If `text` is
    // specified, this may be `undefined` (or not present) in order to not embed any
    // media.
    media?: string;

    // The ID of the post the created post is replying to. If `undefined` or not present,
    // the post will be considered a "top-most" post.
    replyTo?: number;
}
```

### Successful response schema
```ts
interface {
    status: "ok";
    
    // The ID of the created post.
    createdId: number
}
```

## POST `/api/posts/interact`
Adds or removes a post interaction (such a repost or a like). A single user may have at most one interaction of a given kind on a single post.

**Authentication:** required

### Parameter JSON schema
```ts
interface {
    kind: "like" | "repost";
    postId: number;
    action: "add" | "remove";
}
```

### Successful response schema
```ts
interface {
    status: "ok";
}
```

## GET `/api/posts/by_user/:id`
Gets all of the posts made by the given user, including replies. The ID of the user is provided directly as an URL suffix, replacing the `:id` placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    posts: ApiPost[];
}
```

## GET `/api/posts/thread/:id`
Gets a thread view of a given post, which is composed of the post itself, the post it is replying to (if any), and a timeline forming its direct replies. The ID of the post is provided directly as an URL suffix, replacing the `:id` placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    parentPost: ApiPost | null;
    parentAuthor: ApiPost | null;
    post: ApiPost;
    postAuthor: ApiUser;
    replyTimeline: Timeline;
}
```
