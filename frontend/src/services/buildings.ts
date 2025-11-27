import api from "./api";

interface BuildingCreate {
  name: string;
  condominium_id: string;
}

interface BuildingUpdate {
  name?: string;
}

// Traer edificios por condominio
export const getBuildings = async (condominiumId?: string) => {
  const res = await api.get("/buildings", {
    params: { condominium_id: condominiumId }
  });
  return res.data;
};

// Crear edificio
export const createBuilding = async (data: BuildingCreate) => {
  const res = await api.post("/buildings", data);
  return res.data;
};

// Actualizar edificio
export const updateBuilding = async (id: string, data: BuildingUpdate) => {
  const res = await api.put(`/buildings/${id}`, data);
  return res.data;
};

// Eliminar edificio
export const deleteBuilding = async (id: string) => {
  const res = await api.delete(`/buildings/${id}`);
  return res.data;
};
