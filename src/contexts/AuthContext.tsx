"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "@/types";
import { DEMO_USERS, LOGIN_ACCOUNTS } from "@/lib/mock-data";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => false,
  logout: () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("qa_vendor_user_id");
    if (stored) {
      const found = DEMO_USERS.find((u) => u.id === stored);
      if (found) setUser(found);
    }
    setIsLoading(false);
  }, []);

  function login(username: string, password: string): boolean {
    const account = LOGIN_ACCOUNTS.find(
      (a) => a.username === username && a.password === password
    );
    if (!account) return false;
    const found = DEMO_USERS.find((u) => u.id === account.userId);
    if (!found) return false;
    setUser(found);
    localStorage.setItem("qa_vendor_user_id", found.id);
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("qa_vendor_user_id");
  }

  function hasRole(roles: UserRole[]) {
    if (!user) return false;
    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
