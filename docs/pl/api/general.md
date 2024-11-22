# HTTP API Birdhouse
HTTP API Birdhouse jest używane zarówno przez frontend, jak i wszystkie potencjalne zewnętrzne API do komunikacji z backendem Birdhouse. Wszystkie żądania do endpointów Birdhouse powinny wykorzystywać metody `GET` lub `POST`.

HTTP API zawsze zwraca dokument JSON, określający status operacji. Status jest określany przez pole JSON `status`, które może przyjmować jedną z następujących wartości:
- `ok`: żądanie zostało pomyślnie przetworzone. Dokument JSON może zawierać dodatkowe informacje specyficzne dla endpointu.
- `error`: żądanie zakończyło się niepowodzeniem.
- `no-auth`: żądanie wymaga uwierzytelnienia (lub ponownego uwierzytelnienia). Frontendy powinny poprosić użytkownika o podanie danych uwierzytelniających (nawet jeśli wcześniej był zalogowany), gdy napotkają wartość `status` o tej wartości.

Dla wartości innych niż `ok`, dokument JSON zawsze zawiera pole `error`, które zawiera przyjazny dla użytkownika komunikat, opisujący szczegóły przyczyny niepowodzenia żądania.

### Endpointy `GET`
Endpointy `GET` nie używają ciał żądań. Zamiast tego akceptują wszystkie parametry poprzez parametry URL (a w przypadku niektórych endpointów - za pomocą sufiksów w URL, takich jak `/user/get/:id`, gdzie `:id` jest parametrem).

### Endpointy `POST`
Endpointy `POST` mogą akceptować jeden z następujących typów zawartości:
- `application/json` - używany dla większości endpointów. Wszystkie parametry akceptowane przez endpoint są przekazywane za pomocą dokumentu JSON w ciele żądania.
- `application/octet-stream` - używany dla endpointów akceptujących surowe dane binarne, takich jak API do przesyłania multimediów. Tego typu endpointy zazwyczaj akceptują dodatkowe parametry przez parametry URL.

### Uwierzytelnianie
Niektóre endpointy wymagają uwierzytelnienia lub mogą być rozszerzone dzięki jego zastosowaniu. Tokeny uwierzytelniające można uzyskać za pomocą endpointów `/auth` – więcej informacji można znaleźć na stronie poświęconej tej podgrupie. 

Aby przekazać token do endpointów, należy dodać nagłówek HTTP `Authentication` do swojego żądania w formacie `Bearer [TOKEN]`, gdzie `[TOKEN]` to wcześniej uzyskany token.
