# Konfiguracja Birdhouse
Aby utworzyć swoją własną, spersonalizowaną instancję Birdhouse, musisz uruchomić dwie usługi - **backend** oraz **frontend**. Obie znajdują się w różnych katalogach tego repozytorium.

::: warning
Birdhouse jest wciąż we wczesnej fazie rozwoju i nie jest jeszcze gotowy do użycia w środowiskach produkcyjnych. Zaleca się uruchamianie Birdhouse wyłącznie w sieciach lokalnych.
:::

Gotową konfigurację możesz znaleźć w katalogu `demo`. Aby ją uruchomić, wystarczy uruchomić oba skrypty: `run-frontend.bat` i `run-backend.bat`. Niestety, te skrypty są obecnie dostępne tylko dla systemu Windows, ale ich przeniesienie na systemy Unix-podobne powinno być stosunkowo proste.

## Konfiguracja backendu
Przed uruchomieniem backendu, upewnij się, że masz przygotowaną bazę danych MySQL. W swojej bazie danych MySQL zaimportuj plik `/backend/db/schema.sql`. Jeśli coś pójdzie nie tak, możesz użyć skryptu `/backend/db/destroy.sql`, aby usunąć wszystkie dane i tabele Birdhouse.

Najpierw musisz stworzyć plik konfiguracyjny backendu. Jako szablon możesz użyć poniższego dokumentu JSON:

```json
{
    "port": 3000,
    "frontendUrl": "http://localhost:5173",
    "backendUrl": "http://localhost:3000",
    "userContentPath": "user-content",
    "staticContentPath": "static",
    "staticContent": {
        "defaultAvatar": "default-avatar.png",
        "defaultBanner": "default-banner.jpg"
    }
}
```

Wszystkie ścieżki są względne względem katalogu, w którym znajduje się plik konfiguracyjny.

Parametry konfiguracyjne są następujące:
- `port`: port, na którym zostanie uruchomiony serwer HTTP backendu.
- `frontendUrl`: adres URL frontendu. Używany głównie w kontekście CORS.
- `backendUrl`: adres URL, pod którym backend będzie dostępny w Internecie. Jeśli hostujesz Birdhouse w sieci LAN lub jako `localhost`, możesz tutaj podać odpowiedni adres IP lub `localhost`.
- `userContentPath`: ścieżka do folderu, w którym będą przechowywane treści przesłane przez użytkowników.
- `staticContentPath`: ścieżka do folderu z treściami statycznymi, w którym umieszczone są predefiniowane zasoby.
- `staticContent`: definiuje ścieżki do statycznych zasobów, względne względem `staticContentPath`.
    - `defaultAvatar`: obraz używany jako domyślny awatar użytkownika (zdjęcie profilowe).
    - `defaultBanner`: obraz używany jako domyślny baner użytkownika (pokazywane na stronie profilowej).

Wymagane zmienne środowiskowe:
- `BIRDHOUSE_CFG` - plik konfiguracyjny backendu do użycia. Powinien wskazywać na dokument JSON. Jeśli ścieżka nie jest absolutna, będzie traktowana jako względna względem bieżącego katalogu roboczego.
- `DB_HOST` - nazwa hosta bazy danych MySQL, z którą należy się połączyć.
- `DB_USER` - nazwa użytkownika bazy danych, którym należy się zalogować.
- `DB_PASSWORD` - hasło użytkownika bazy danych. Opcjonalne. Jeśli nie zostanie podane, zakłada się, że użytkownik bazy danych nie ma ustawionego hasła.
- `DB_DATABASE` - nazwa bazy danych na serwerze, z której należy korzystać.

Po ustawieniu tych zmiennych, najpierw uruchom `npm install` w katalogu `/backend`. Następnie uruchom serwer za pomocą `npm run serve`.

## Konfiguracja frontendu
W przypadku frontendu, musisz ustawić tylko jedną zmienną środowiskową: `VITE_BIRDHOUSE_API_URL`, która powinna wskazywać na adres URL API backendu, dostępny z Internetu (lub sieci, jeśli hostowany lokalnie). Po ustawieniu zmiennej uruchom `npm install`, a następnie `npm run dev`, aby uruchomić frontend.

::: warning
Obecnie komenda `npm run dev` jest tymczasowa. Uruchamia frontend w trybie deweloperskim - pamiętaj, że Birdhouse nie jest jeszcze gotowy do użycia w środowiskach produkcyjnych.
:::