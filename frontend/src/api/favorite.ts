import { apiClient } from "./client";
import type { Video } from "../types";

export async function toggleFavorite(videoId: string): Promise<boolean> {
    const { data } = await apiClient.post<{ isFavorite: boolean }>(`/video/${videoId}/favorite`);
    return data.isFavorite;
}

export async function checkFavorite(videoId: string): Promise<boolean> {
    const { data } = await apiClient.get<{ isFavorite: boolean }>(`/video/${videoId}/favorite`);
    return data.isFavorite;
}

export async function getFavorites(): Promise<Video[]> {
    const { data } = await apiClient.get<Video[]>("/user/favorites");
    return data;
}
