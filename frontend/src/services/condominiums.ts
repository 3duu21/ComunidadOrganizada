import api from "./api";

export interface Condominium {
  id: string;
  name: string;
  role?: string;
  created_at?: string;
}

// DESPUÉS
export const getCondominiums = async (): Promise<Condominium[]> => {
  const res = await api.get("/condominiums"); // 👈 misma ruta que el backend
  return res.data;
};

export const createCondominium = async (payload: { name: string }) => {
  const res = await api.post("/condominiums", payload);
  return res.data;
};

export const updateCondominium = async (
  id: string,
  payload: { name: string }
) => {
  const res = await api.patch(`/condominiums/${id}`, payload);
  return res.data;
};

export const deleteCondominium = async (id: string) => {
  const res = await api.delete(`/condominiums/${id}`);
  return res.data;
};
