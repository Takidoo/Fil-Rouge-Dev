import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { getMe } from "../api/user";
import { authStorage } from "../utils/storage";

interface AuthContextValue {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(authStorage.getToken);
  const [user, setUser] = useState<User | null>(authStorage.getUser);

  // Keep localStorage in sync with the auth state
  useEffect(() => {
    if (token) {
      authStorage.setToken(token);
    } else {
      authStorage.clear();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      authStorage.setUser(user);
    } else {
      authStorage.clearUser();
    }
  }, [user]);

  // On mount, refresh the profile if we have a token (keeps the role up to date)
  useEffect(() => {
    if (token && !user) {
      getMe()
        .then(setUser)
        .catch(() => {
          setToken(null);
          setUser(null);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (newToken: string) => {
    // Store the token first so the axios interceptor can authenticate getMe()
    authStorage.setToken(newToken);
    try {
      const me = await getMe();
      setToken(newToken);
      setUser(me);
    } catch (err) {
      authStorage.clear();
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateUser, isAuthenticated: !!token }),
    [user, login, logout, updateUser, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
