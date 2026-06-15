import { apiClient } from "./client";
import type { Comment } from "../types";

export async function getApprovedComments(videoId: string): Promise<Comment[]> {
  const { data } = await apiClient.get<Comment[]>(`/comment/video/${videoId}`);
  return data;
}

export async function createComment(videoId: string, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(`/comment/video/${videoId}`, { content });
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  await apiClient.delete(`/comment/${id}`);
}
