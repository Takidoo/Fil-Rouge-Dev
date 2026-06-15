import { STORAGE_KEYS } from "../constants";
import type { User } from "../types";

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.token, token);
  },

  getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.user);
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};
