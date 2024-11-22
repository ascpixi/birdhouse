# Birdhouse HTTP API
The Birdhouse HTTP API is used by both the frontend, and all potential third-party APIs to interface with Birdhouse's backend. All requests to Birdhouse endpoints should use either the `GET` or `POST` methods.

The HTTP API always returns a JSON document, specifying the status of the operation. This status is determined by the `status` string JSON field. Status might be one of:
- `ok`: the request was processed successfully. The JSON document may contain more information specific to the endpoint.
- `error`: the request failed.
- `no-auth`: the request requires authentication (or re-authentication). Frontends should request the user to provide their credentials (even if they were previously logged in) upon encountering this `status` value.

For values other than `ok`, the JSON document always contains an `error` field, which provides a user-friendly message, providing the specifics on why the request has failed.

`GET` endpoints do not use request bodies, and instead accept all parameters through URL parameters (and, for some endpoints, URL suffixes, such as `/user/get/:id`, where `:id` is a parameter).

`POST` endpoints may accept one of the following content types:
- `application/json` - used for most endpoints. All parameters accepted by the endpoint are provided via the JSON document included in the request body.
- `application/octet-stream` - used for endpoints which accept raw binary data, like media upload APIs. Such endpoints, if they have any, usually accept parameters through URL parameters .

Some endpoints require - or are augmented by - authentication. Authentication tokens may be obtained by `/auth` endpoints - more information is available on that sub-page. To provide the token to endpoints, include an `Authentication` HTTP header in your request, with the format of `Bearer [TOKEN]`, where `[TOKEN]` is the previously obtained token.
