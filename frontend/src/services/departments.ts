import api from "./api";

interface DepartmentCreate {
  floor: number;
  number: string;
  building_id: string;
}

interface DepartmentUpdate {
  floor?: number;
  number?: string;
}

// Traer departamentos por edificio
export const getDepartments = async (buildingId: string) => {
  const res = await api.get(`/departments?building_id=${buildingId}`);
  return res.data;
};

// Crear departamento
export const createDepartment = async (data: DepartmentCreate) => {
  const res = await api.post("/departments", data);
  return res.data;
};

// Actualizar departamento
export const updateDepartment = async (id: string, data: DepartmentUpdate) => {
  const res = await api.put(`/departments/${id}`, data);
  return res.data;
};

// Eliminar departamento
export const deleteDepartment = async (id: string) => {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
};
