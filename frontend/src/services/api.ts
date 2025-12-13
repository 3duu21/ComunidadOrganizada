// src/services/api.ts
import axios from "axios";
import { logout as authLogout } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// 🔹 Interceptor REQUEST: agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor RESPONSE: manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 🔐 Token inválido / expirado
    if (status === 401) {
      authLogout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ⛔ Plan vencido / cuenta desactivada
    if (status === 403) {
      authLogout();
      window.location.href = "/plan-vencido";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
