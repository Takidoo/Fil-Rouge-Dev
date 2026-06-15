import { apiClient } from "./client";
import type { Video, SearchVideosResult } from "../types";

export interface SearchVideosParams {
  q?: string;
  genreIds?: string[];
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

export async function getVideos(): Promise<Video[]> {
  const { data } = await apiClient.get<Video[]>("/video/");
  return data;
}

export async function searchVideos(params: SearchVideosParams): Promise<SearchVideosResult> {
  const { q, genreIds, limit, offset, signal } = params;
  const { data } = await apiClient.get<SearchVideosResult>("/video/search", {
    params: {
      q: q || undefined,
      genreIds: genreIds && genreIds.length > 0 ? genreIds.join(",") : undefined,
      limit,
      offset,
    },
    signal,
  });
  return data;
}

export async function getVideo(id: string): Promise<Video> {
  const { data } = await apiClient.get<Video>(`/video/${id}`);
  return data;
}

export async function uploadVideo(
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Video> {
  const { data } = await apiClient.post<Video>("/video/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return data;
}

export async function deleteVideo(id: string): Promise<void> {
  await apiClient.delete(`/video/${id}`);
}
