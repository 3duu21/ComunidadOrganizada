// src/services/me.ts
import api from "./api";

export interface MeRole {
  role: string;
  condominium_id: string;
  condominium_name: string;
}

export interface MeSettings {
  default_condominium_id?: string | null;
  theme?: string;
  notify_email?: boolean;
  notify_morosidad?: boolean;
}

export interface MeResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar_url?: string;
  };
  roles: MeRole[];
  settings: MeSettings;
}

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get("/me");
  return data;
};

export const updateProfile = async (payload: {
  name?: string;
  phone?: string;
  avatar_url?: string;
}) => {
  const { data } = await api.patch("/me/profile", payload);
  return data;
};

export const updateSettings = async (payload: MeSettings) => {
  const { data } = await api.patch("/me/settings", payload);
  return data;
};
