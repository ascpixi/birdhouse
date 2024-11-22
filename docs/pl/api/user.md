# Grupa endpointów HTTP API `/api/user`
Endpoint `/api/user` w HTTP API Birdhouse służy do pobierania, modyfikowania i obsługi interakcji między kontami użytkowników.

## GET `/api/user/get/:handle`
Pobiera dane o użytkowniku na podstawie jego identyfikatora (`handle`), który jest przekazywany jako końcówka URL, zastępując symbol zastępczy `:handle`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    ...ApiUser; // Schemat zawiera wszystkie pola interfejsu ApiUser.
}
```

## POST `/api/user/modify`
Zmienia dane użytkownika o swobodnej formie (np. opis, ustawienia).

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    ...Timeline; // Schemat zawiera wszystkie pola interfejsu Timeline.
}
```