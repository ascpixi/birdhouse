const imageExtensions = [
    ".jpg", ".jfif", ".jpeg", // image/jpeg
    ".png", // image/png
    ".gif", // image/gif
    ".webp", // image/webp
];

const videoExtensions = [
    ".mp4", ".m4v", // video/mp4
    ".mpeg", ".mpg", // video/mpeg
    ".mkv" // video/mkv
];

export function getMediaTypeFromUrl(url: string) {
    if (imageExtensions.some(x => url.endsWith(x)))
        return "image";

    if (videoExtensions.some(x => url.endsWith(x)))
        return "video";

    console.warn(`Cannot determine media type for URL ${url}.`);
    return "unknown";
}

export function getRelativeTimeString(date: Date | string): string {
    if (typeof date === "string") {
        date = new Date(date);
    }

    const now = new Date();
    const dMs = now.getTime() - date.getTime();

    const dSecs = Math.floor(dMs / 1000);
    const dMins = Math.floor(dSecs / 60);
    const dHours = Math.floor(dMins / 60);
    const dDays = Math.floor(dHours / 24);

    const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (dDays > 0) return fmt.format(-dDays, "day");
    if (dHours > 0) return fmt.format(-dHours, "hour");
    if (dMins > 0) return fmt.format(-dMins, "minute");
    return fmt.format(-dSecs, "second");
}
  