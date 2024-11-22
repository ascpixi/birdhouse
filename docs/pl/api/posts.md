# Grupa endpointów HTTP API `/api/posts`
Endpoint `/api/posts` w HTTP API Birdhouse służy do tworzenia, pobierania i interakcji z postami tworzonymi przez użytkowników.

## GET `/api/posts/:id`
Pobiera post o podanym ID. ID posta jest przekazywane jako końcówka URL, zastępując symbol zastępczy `:id`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    post: ApiPost;
    author: ApiUser;
}
```

## POST `/api/posts/create`
Tworzy nowy post użytkownika. W ciele żądania musi być obecne przynajmniej jedno z pól: `text` lub `media`.

**Authentication:** required

### Schemat JSON parametrów
```ts
interface {
    // Tekstowa treść posta do utworzenia. Jeśli określono `media`, to pole może być
    // `undefined` (lub nieobecne), aby utworzyć post wyłącznie z treścią multimedialną.
    text?: string;

    // URL zwrócony przez endpoint `/api/media`, który ma być używany jako treść multimedialna.
    // Jeśli określono `text`, to pole może być `undefined` (lub nieobecne), aby nie osadzać
    // żadnych mediów.
    media?: string;

    // ID posta, na który nowo tworzony post odpowiada. Jeśli `undefined` lub brak tego pola,
    // post zostanie uznany za "post główny".
    replyTo?: number;
}
```

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    
    // ID utworzonego posta.
    createdId: number;
}
```

## POST `/api/posts/interact`
Dodaje lub usuwa interakcję z postem (np. polubienie lub udostępnienie). Jeden użytkownik może mieć maksymalnie jedną interakcję danego typu dla jednego posta.

**Authentication:** required

### Schemat JSON parametrów
```ts
interface {
    kind: "like" | "repost"; // Typ interakcji: polubienie lub udostępnienie.
    postId: number;          // ID posta, z którym wchodzimy w interakcję.
    action: "add" | "remove"; // Akcja: dodanie lub usunięcie interakcji.
}
```

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
}
```

## GET `/api/posts/by_user/:id`
Pobiera wszystkie posty utworzone przez danego użytkownika, w tym odpowiedzi. ID użytkownika jest przekazywane jako końcówka URL, zastępując symbol zastępczy `:id`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    posts: ApiPost[];
}
```

## GET `/api/posts/thread/:id`
Pobiera widok wątku dla danego posta, który obejmuje sam post, post, na który odpowiada (jeśli istnieje), oraz oś czasu z jego bezpośrednimi odpowiedziami. ID posta jest przekazywane jako końcówka URL, zastępując symbol zastępczy `:id`.

**Authentication:** optional

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";

    // Post nadrzędny (jeśli istnieje).
    parentPost: ApiPost | null;
    parentAuthor: ApiPost | null;

    // Pobierany post i jego autor.
    post: ApiPost;
    postAuthor: ApiUser;

    // Oś czasu z bezpośrednimi odpowiedziami.
    replyTimeline: Timeline;
}
```