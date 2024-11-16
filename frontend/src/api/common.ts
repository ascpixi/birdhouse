export type ApiExceptionalStatus = "error" | "no-auth";

export type ApiResponse<T> = Promise<
  | { status: "ok"; } & T
  | { status: ApiExceptionalStatus; error: string }
>;

export async function returnApiResponse(resp: Response, endpoint: string) {
    const json = await resp.json();
    if (!resp.ok || json.status !== "ok")
        return failedRequest(endpoint, json, resp);

    return json;
}

export function failedRequest(endpoint: string, json: any, resp: Response) {
    console.error(`API call to ${endpoint} failed:`, json);
    console.error("Raw response:", resp);

    if (json.status === "no-auth") {
        handleFailedAuth();
    }

    return json;
}

/**
 * Requires the client to be authentication, throwing an error if it is not. If the client
 * *is* authenticated, returns the session token.
 */
export function requireAuth(): string {
    const token = localStorage.getItem("token");
    if (!token) {
        handleFailedAuth();
        throw new Error("Attempted to invoke an endpoint which requires authorization without a token.");
    }

    return token;
}

/**
 * Redirects the user to a page they can re-authenticate. This function should be called
 * when the API returns a status of `no-auth`.
 */
export function handleFailedAuth() {
    console.log("Redirecting the user to the authentication page...");
    location.pathname = "/auth";
}

export function apiFetchOptions(method: string): Partial<RequestInit> {
    const token = localStorage.getItem("token");

    return {
        method,
        cache: "no-cache",
        headers: {
            ...(method == "POST" && { "Content-Type": "application/json" }),
            ...(token !== null && { "Authorization": `Bearer ${token}` })
        }
    }
}