# `/api/auth` HTTP API endpoint group
The `/api/auth` endpoint of the Birdhouse HTTP API serves to obtain authentication tokens, either by logging in to existing accounts, or by creating new ones.

Authentication tokens obtained by endpoints of this endpoint group may be used in `Authentication` HTTP headers. Do note that an authentication token grants full and complete access to an account, and as such, should be kept secret.

All endpoints in the HTTP API documentation list their **Authentication** state, which may be one of the following:
- **"not needed"** - authentication is not needed and the `Authentication` HTTP header is ignored.
- **"optional"** - authentication is not needed, but it may augment the function of the endpoint, e.g. returning data specific to the requesting user.
- **"required"** - authentication is needed, and the request will failed with a missing or invalid authentication token.

## POST `/api/auth/login`
Obtains an authentication token to an existing Birdhouse account. The token may expire after a period of time, after which the user will be required to re-authenticate as a security measure.

**Authentication:** not needed

### Parameter JSON schema
```ts
interface {
    // The handle of the target user account to attempt to authenticate with.
    handle: string;

    // A Base-64 encoded version of the password.
    pwd: string;
}
```

### Successful response schema
```ts
interface {
    status: "ok";
    token: string
}
```

## POST `/api/auth/register`
Creates a new Birdhouse account, and obtains an authentication token for that account. The returned token has the same behavior as a token retrieved via `/api/auth/login`. The password must meet password requirements - namely, the `pwd` field, decoded from Base64, must be larger or equal to 6 characters in size.

**Authentication:** not needed

### Parameter JSON schema
```ts
interface {
    // The desired handle of the account to create. If the handle is already used by
    // another user account, the request will fail.
    handle: string;

    // A Base-64 encoded version of the desired password for the account. If the password
    // does not meet the password requirements, the request will fail.
    pwd: string;
}
```

### Successful response schema
```ts
interface {
    status: "ok";
    token: string
}
```

## POST `/api/auth/invalidate`
Invalidates an existing authentication token, making it unable to be used for further authentication attempts. This endpoint should be called when logging out.

### Parameter JSON schema
```ts
interface {
    // The token to invalidate.
    token: string;
}
```

### Successful response schema
```ts
interface {
    status: "ok";
}
```
