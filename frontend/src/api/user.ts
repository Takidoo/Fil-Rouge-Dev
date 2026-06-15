import { apiClient } from "./client";
import type { User } from "../types";

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  password?: string;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/user/me");
  return data;
}

export async function updateUser(payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.put<User>("/user/", payload);
  return data;
}
