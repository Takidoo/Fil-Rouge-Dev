export const STORAGE_KEYS = {
  token: "token",
  user: "user",
} as const;

export const VIDEOS_BASE_URL = (import.meta.env.VITE_API_URL ?? "") + "/videos";

export const SEARCH_PAGE_SIZE = 10;

export const COMMENT_MAX_LENGTH = 2000;
