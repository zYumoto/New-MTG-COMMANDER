import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiPost } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  function saveSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function login(email, password) {
    const data = await apiPost("/api/auth/login", { email, password });
    saveSession(data.token, data.user);
  }

  async function register(username, email, password) {
    const data = await apiPost("/api/auth/register", { username, email, password });
    saveSession(data.token, data.user);
  }

  useEffect(() => {}, [token]);

  const value = useMemo(
    () => ({ token, user, isAuth: !!token, login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
  return ctx;
}
