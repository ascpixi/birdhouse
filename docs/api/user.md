# `/api/user` HTTP API endpoint group
The `/api/user` endpoint of the Birdhouse HTTP API serves to fetch, modify, and handle interactions between user accounts.

## GET `/api/user/get/:handle`
Gets data about a user given their handle, which is provided by the `:handle` URL placeholder.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    ...ApiUser; // The schema contains all fields from the ApiUser interface.
}
```

## POST `/api/user/modify`
Changes free-form data of a user.

**Authentication:** optional

### Successful response schema
```ts
interface {
    status: "ok";
    ...Timeline; // The schema contains all fields from the Timeline interface.
}
```
