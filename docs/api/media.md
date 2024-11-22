# `/api/media` HTTP API endpoint group
The `/api/media` endpoint of the Birdhouse HTTP API serves to upload user-submitted content, which may be used throughout the service. Any media URL fields in other parts of the API always refer to URLs returned by the endpoints in this group.

## POST `/api/media/upload`
Uploads a media file (either an image or video) to the underlying media host service. The type of the media file is determined via the content of the raw binary stream.

**Authentication:** required

::: info
This endpoint accepts an `application/octet-stream` content type, which is the binary data to upload.
:::

### Successful response schema
```ts
interface {
    status: "ok";

    // The media URL, which may be used to reference media throughout Birdhouse.
    url: string
}
```
