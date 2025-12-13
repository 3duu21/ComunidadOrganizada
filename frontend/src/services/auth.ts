// src/services/auth.ts
import api from "./api";

export type UserRole = "admin" | "owner";

export interface User {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
  };
}

// --- Helpers internos ---

function parseJwt(token: string): any | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpiredInternal(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  const nowSeconds = Date.now() / 1000;
  return payload.exp < nowSeconds;
}

// --- API pública ---

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });

  const data = res.data;

  const normalizedRole: UserRole =
    data.user.role === "owner" ? "owner" : "admin";

  const user: User = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: normalizedRole,
  };

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

interface SignupTrialPayload {
  name: string;
  email: string;
  password: string;
}

export async function signupTrial(payload: SignupTrialPayload): Promise<User> {
  const res = await api.post<LoginResponse>("/auth/signup-trial", payload);

  const data = res.data;

  const normalizedRole: UserRole =
    data.user.role === "owner" ? "owner" : "admin";

  const user: User = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: normalizedRole,
  };

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}


export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;

  // Si el token está vencido, limpiamos y devolvemos null
  if (isTokenExpiredInternal(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }

  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const user = JSON.parse(stored) as User;
    if (user.role !== "admin" && user.role !== "owner") return null;
    return user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpiredInternal(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
  return true;
}

// Por si quieres usarlo en el futuro
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  return isTokenExpiredInternal(token);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
