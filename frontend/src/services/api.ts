// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // 👇 ESTA ES LA FORMA CORRECTA (sin reasignar el objeto headers)
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
