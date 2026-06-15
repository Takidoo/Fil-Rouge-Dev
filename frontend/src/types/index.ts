export type Role = "ADMIN" | "USER";

export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CommentModerationStatus = "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: Role;
}

export interface AdminUser extends User {
  _count: { videos: number };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  path: string;
  thumbnailPath: string | null;
  hlsPath: string | null;
  uploadedAt: string;
  userId: string;
  genres: Genre[];
}

export interface SearchVideosResult {
  items: Video[];
  total: number;
  limit: number;
  offset: number;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  userId: string;
  videoId: string;
  user: { id: string; name: string };
}

export interface PendingComment extends Comment {
  video: { id: string; title: string };
}

export interface AuthResponse {
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
