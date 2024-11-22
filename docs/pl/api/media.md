# Grupa endpointów HTTP API `/api/media`
Endpoint `/api/media` w HTTP API Birdhouse służy do przesyłania treści przesyłanych przez użytkowników, takich jak obrazy lub filmy, które mogą być wykorzystywane w różnych częściach usługi. Wszystkie pola URL mediów w innych częściach API zawsze odnoszą się do adresów URL zwracanych przez endpointy z tej grupy.

## POST `/api/media/upload`
Przesyła plik multimedialny (obraz lub wideo) do podstawowej usługi hostingu multimediów. Typ pliku multimedialnego jest określany na podstawie zawartości przesyłanego strumienia binarnego.

**Authentication:** required

::: info
Ten endpoint akceptuje typ zawartości `application/octet-stream`, czyli dane binarne do przesłania.
:::

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";

    // Adres URL mediów, który może być używany do odwoływania się do przesłanych treści w Birdhouse.
    url: string;
}
```