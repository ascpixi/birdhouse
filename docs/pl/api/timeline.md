# Grupa endpointów HTTP API `/api/timeline`
Endpoint `/api/timeline` w HTTP API Birdhouse służy do pobierania osi czasu - posortowanej kolekcji wybranych postów, zawierającej wszystkie wymagane dane relacyjne (takie jak struktury `ApiUser` opisujące relację post-autor) uwzględnione w obiekcie osi czasu.

## GET `/api/timeline/user/:id`
Tworzy oś czasu zawierającą wszystkie posty danego użytkownika, posortowane według ich aktualności. ID użytkownika jest przekazywane jako końcówka URL, zastępując symbol zastępczy `:id`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    ...Timeline; // Schemat zawiera wszystkie pola interfejsu Timeline.
}
```

## GET `/api/timeline/home/:page`
Pobiera posty na stronę główną (For You) żądającego użytkownika lub ogólną (bez użytkownika). Zwracane posty mogą pochodzić z całej sieci postów Birdhouse. API obsługuje paginację, gdzie numer strony jest przekazywany za pomocą symbolu zastępczego `:page`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    ...Timeline; // Schemat zawiera wszystkie pola interfejsu Timeline.
}
```