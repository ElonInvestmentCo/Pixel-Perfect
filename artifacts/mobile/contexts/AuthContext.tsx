import React, { createContext, useContext, useEffect, useState } from "react";
import * as storage from "@/lib/storage";

export type SessionUser = {
  id:        string;
  email:     string;
  name:      string;
  avatarUrl?: string | null;
};

export type Session = {
  token: string;
  user:  SessionUser;
};

type AuthContextValue = {
  session:     Session | null;
  isRestoring: boolean;
  saveSession: (token: string, user: SessionUser) => Promise<void>;
  clearSession: () => Promise<void>;
};

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,     setSession]     = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ]);
        if (token && userJson) {
          setSession({ token, user: JSON.parse(userJson) as SessionUser });
        }
      } catch {
        // start unauthenticated on any error
      } finally {
        setIsRestoring(false);
      }
    })();
  }, []);

  const saveSession = async (token: string, user: SessionUser) => {
    await Promise.all([
      storage.setItem(TOKEN_KEY, token),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    setSession({ token, user });
  };

  const clearSession = async () => {
    await Promise.all([
      storage.deleteItem(TOKEN_KEY),
      storage.deleteItem(USER_KEY),
    ]);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isRestoring, saveSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
