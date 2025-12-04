// src/services/auth.ts
import api from "./api";

// TIPOS
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
    role: string; // viene como string crudo desde el backend
  };
}

// 🔹 Login
export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });

  const data = res.data;

  // normalizamos rol para evitar problemas
  const normalizedRole: UserRole =
    data.user.role === "owner" ? "owner" : "admin";

  const user: User = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: normalizedRole,
  };

  // Guardamos token + usuario en localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

// 🔹 Obtener usuario actual
export function getCurrentUser(): User | null {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const user = JSON.parse(stored) as User;

    // Validación de rol
    if (user.role !== "admin" && user.role !== "owner") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

// 🔹 Obtener token
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// 🔹 Verificar autenticación
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

// 🔹 Logout ordenado
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
