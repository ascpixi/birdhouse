# Grupa endpointów HTTP API `/api/auth`
Endpoint `/api/auth` w HTTP API Birdhouse służy do uzyskiwania tokenów uwierzytelniających, zarówno poprzez logowanie do istniejących kont, jak i tworzenie nowych.

Tokeny uwierzytelniające uzyskane za pomocą endpointów tej grupy mogą być używane w nagłówkach HTTP `Authentication`. Należy pamiętać, że token uwierzytelniający daje pełny i nieograniczony dostęp do konta, dlatego powinien być utrzymywany w tajemnicy.

Każdy endpoint w dokumentacji HTTP API określa swój stan **Authentication**, który może być jednym z poniższych:
- **"not needed"** - uwierzytelnianie nie jest wymagane, a nagłówek HTTP `Authentication` jest ignorowany.
- **"optional"** - uwierzytelnianie nie jest wymagane, ale może rozszerzyć funkcję endpointu, np. zwracając dane specyficzne dla użytkownika wykonującego żądanie.
- **"required"** - uwierzytelnianie jest wymagane, a żądanie zakończy się niepowodzeniem w przypadku braku lub nieprawidłowego tokena uwierzytelniającego.

---

## POST `/api/auth/login`
Uzyskuje token uwierzytelniający dla istniejącego konta Birdhouse. Token może wygasnąć po pewnym czasie, po czym użytkownik będzie musiał ponownie się uwierzytelnić jako środek bezpieczeństwa.

**Authentication:** not needed

### Schemat JSON parametrów
```ts
interface {
    // Identyfikator konta użytkownika, na które próbuje się zalogować.
    handle: string;

    // Hasło zakodowane w Base64.
    pwd: string;
}
```

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    token: string;
}
```

---

## POST `/api/auth/register`
Tworzy nowe konto Birdhouse i uzyskuje token uwierzytelniający dla tego konta. Zwrócony token działa w ten sam sposób, co token uzyskany za pomocą `/api/auth/login`. Hasło musi spełniać wymagania - pole `pwd`, po dekodowaniu Base64, musi mieć co najmniej 6 znaków.

**Authentication:** not needed

### Schemat JSON parametrów
```ts
interface {
    // Żądany identyfikator konta do utworzenia. Jeśli identyfikator jest już zajęty przez inne konto użytkownika,
    // żądanie zakończy się niepowodzeniem.
    handle: string;

    // Hasło zakodowane w Base64, które ma być używane dla konta. Jeśli hasło nie spełnia wymagań,
    // żądanie zakończy się niepowodzeniem.
    pwd: string;
}
```

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
    token: string;
}
```

---

## POST `/api/auth/invalidate`
Unieważnia istniejący token uwierzytelniający, co uniemożliwia jego dalsze użycie do prób uwierzytelnienia. Ten endpoint należy wywołać podczas wylogowywania.

**Authentication:** required

### Schemat JSON parametrów
```ts
interface {
    // Token do unieważnienia.
    token: string;
}
```

### Schemat odpowiedzi w przypadku sukcesu
```ts
interface {
    status: "ok";
}
```