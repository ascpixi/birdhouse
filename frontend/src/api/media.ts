import { ApiResponse, requireAuth, returnApiResponse } from "./common";

const apiUrl = import.meta.env.VITE_BIRDHOUSE_API_URL;

export async function upload(data: ArrayBuffer): ApiResponse<{
    url: string
}> {
    const resp = await fetch(`${apiUrl}/media/upload`, {
        method: "POST",
        body: data,
        cache: "no-cache",
        headers: {
            "Content-Type": "application/octet-stream",
            "Authorization": `Bearer ${requireAuth()}`,
        }
    });

    return returnApiResponse(resp, "/media/upload");
}
