import { apiClient } from "./client";
import type { AdminUser } from "../types";

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>("/admin/users");
  return data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
