export const AUTH = {
    saltRounds: 12,
    tokenTtl: "8h",
} as const;

export const UPLOAD = {
    maxVideoSizeBytes: 500 * 1024 * 1024,
    video: {
        mimeTypes: ["video/mp4"],
        extensions: [".mp4"],
    },
    thumbnail: {
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        extensions: [".jpg", ".jpeg", ".png", ".webp"],
    },
} as const;

export const AUTH_RATE_LIMIT = {
    windowMs: 15 * 60 * 1000,
    limit: 20,
} as const;
