import api from "../services/api";

// Crear gasto
export const createExpense = async (data: any) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

// Listar gastos, opcionalmente por edificio
export const getExpenses = async (buildingId?: string) => {
  const res = await api.get("/expenses", {
    params: buildingId ? { building_id: buildingId } : undefined,
  });
  console.log("Gastos recibidos:", res.data);
  return res.data;
};

// Obtener gasto por ID
export const getExpense = async (id: string) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

// Editar gasto
export const updateExpense = async (id: string, data: any) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

// Eliminar gasto
export const deleteExpense = async (id: string) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

// Tipos de gasto
export const getExpenseTypes = async () => {
  const res = await api.get("/expenses/types/list");
  return res.data;
};
