import { apiClient } from "./client";
import type { Genre } from "../types";

export async function getGenres(): Promise<Genre[]> {
  const { data } = await apiClient.get<Genre[]>("/genre/");
  return data;
}
