import { apiClient } from "./client";
import type { Video } from "../types";

export type VideoWithProgress = Video & { progress: number };

export async function getWatchHistory(): Promise<VideoWithProgress[]> {
    const { data } = await apiClient.get<VideoWithProgress[]>("/user/history");
    return data;
}

export async function getProgress(videoId: string): Promise<number> {
    const { data } = await apiClient.get<{ progress: number }>(`/video/${videoId}/progress`);
    return data.progress;
}

export async function updateProgress(videoId: string, progress: number): Promise<void> {
    await apiClient.put(`/video/${videoId}/progress`, { progress });
}
