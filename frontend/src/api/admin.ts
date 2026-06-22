import { apiClient } from "./client";
import type { AdminComment, AdminUser, CommentModerationStatus, Role } from "../types";

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>("/admin/users");
  return data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function updateAdminUserRole(id: string, role: Role): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role });
  return data;
}

export async function getAdminComments(): Promise<AdminComment[]> {
  const { data } = await apiClient.get<AdminComment[]>("/admin/comments");
  return data;
}

export async function moderateAdminComment(id: string, status: CommentModerationStatus): Promise<AdminComment> {
  const { data } = await apiClient.patch<AdminComment>(`/admin/comments/${id}`, { status });
  return data;
}

export async function deleteAdminComment(id: string): Promise<void> {
  await apiClient.delete(`/admin/comments/${id}`);
}

export async function deleteAdminVideo(id: string): Promise<void> {
  await apiClient.delete(`/admin/videos/${id}`);
}
