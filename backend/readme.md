# Birdhouse Backend (API)
All endpoints return objects with a `success` field. If the value of this field is `false`, the only other available field is `error`, which is a string which describes the error. Otherwise, the other available fields depend on the specific endpoint used. These fields are described in the `Returns` sub-sections of the endpoints described below.

## `/api/auth`
These endpoints implement authentication-related functionality.

### `/api/auth/login`
**Accepts:**
- `handle`: the handle of the user.
- `pwd`: a Base64-encoded representation of the user's password.

**Returns:**
- `token`: a unique session token for the user, which allows for further authentication.

### `/api/auth/register`
**Accepts:**
- `handle`: the desired handle of the account to create.
- `pwd`: a Base64-encoded representation of the user's password.

**Returns:**
- `token`: a unique session token for the newly created account, which allows for further authentication.

## `/api/user`
These endpoints implement functionality to query and modify user entities.


