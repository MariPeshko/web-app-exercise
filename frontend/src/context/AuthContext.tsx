"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { apiLogin, apiSignup, apiGetMe } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to persist/read the JWT token (stored in both localStorage + cookie)
// localStorage  → used by client-side JS for API calls
// cookie        → used by Next.js middleware to protect routes server-side

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function setToken(token: string) {
  localStorage.setItem("access_token", token);
  document.cookie = `access_token=${token}; path=/; max-age=3600; samesite=lax`;
}

function removeToken() {
  localStorage.removeItem("access_token");
  document.cookie = "access_token=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // On mount, check if we have a saved token and restore the session
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoading(true);
      apiGetMe(token)
        .then((res) => {
          setUser({
            id: res.user_data.sub,
            name: res.user_data.nickname,
            email: res.user_data.sub,
          });
        })
        .catch(() => {
          // Token expired or invalid — clear it
          removeToken();
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(email, password);
      setToken(data.access_token);

      // Fetch user info with the new token
      const me = await apiGetMe(data.access_token);
      setUser({
        id: me.user_data.sub,
        name: me.user_data.nickname,
        email: me.user_data.sub,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (nickname: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Register the user
      await apiSignup(email, nickname, password);

      // 2. Automatically log them in
      const data = await apiLogin(email, password);
      setToken(data.access_token);

      const me = await apiGetMe(data.access_token);
      setUser({
        id: me.user_data.sub,
        name: me.user_data.nickname,
        email: me.user_data.sub,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
