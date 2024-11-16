import { apiFetchOptions, ApiResponse, returnApiResponse } from "./common";

const apiUrl = import.meta.env.VITE_BIRDHOUSE_API_URL;

/**
 * Attempts to authenticate to the given user account.
 */
export async function login(handle: string, pwd: string): ApiResponse<{
    token: string
}> {
    const resp = await fetch(`${apiUrl}/auth/login`, {
        body: JSON.stringify({ handle, pwd: btoa(pwd) }),
        ...apiFetchOptions("POST")
    });

    return returnApiResponse(resp, "/auth/login");
}

/**
 * Attempts to create a new user account.
 */
export async function register(handle: string, pwd: string): ApiResponse<{
    token: string
}> {
    const resp = await fetch(`${apiUrl}/auth/register`, {
        body: JSON.stringify({ handle, pwd: btoa(pwd) }),
        ...apiFetchOptions("POST")
    });

    return returnApiResponse(resp, "/auth/register");
}

/**
 * Invalidates a previously created session. This makes the given `token` invalid, and will
 * not be able to be used to perform further authenticated requests.
 */
export async function invalidate(token: string): ApiResponse<{}> {
    const resp = await fetch(`${apiUrl}/auth/invalidate`, {
        body: JSON.stringify({ token }),
        ...apiFetchOptions("POST")
    });

    return returnApiResponse(resp, "/auth/invalidate");
}