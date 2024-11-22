# `/api/timeline` HTTP API endpoint group
The `/api/timeline` endpoint of the Birdhouse HTTP API serves to fetch timelines - a sorted collection of select posts, with all required relationship data (such as the `ApiUser` structures for the post-author relationship) included in the timeline object.

## GET `/api/timeline/user/:id`
Creates a timeline which contains all of the posts of the given user, sorted by their recency. The ID of the user is provided directly as an URL suffix, replacing the `:id` placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    ...Timeline; // The schema contains all fields from the Timeline interface.
}
```

## GET `/api/timeline/home/:page`
Fetches posts for the requesting user's (or a generic no-user) home (For You) page. The posts returned may be sourced from the entirety of Birdhouse's post network. The API supports pagination, where the page is provided via the `:page` placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    ...Timeline; // The schema contains all fields from the Timeline interface.
}
```
