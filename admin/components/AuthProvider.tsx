"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange } from "@/lib/auth";

type AnyUser = { email: string; uid: string } | null;
type AuthState = { user: AnyUser; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    return onAuthChange((user) => setState({ user: user as AnyUser, loading: false }));
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
