import api from "../services/api";

// -----------------------------
// TIPOS
// -----------------------------
export interface ExpenseCreate {
  amount: number;
  description?: string;
  type_expense: string;
  date: string;
  building_id: string;
  payment_method?: string;
  document_number?: string;
}

export interface ExpenseUpdate extends Partial<ExpenseCreate> {}

// -----------------------------
// CRUD
// -----------------------------

// Crear gasto
export const createExpense = async (data: ExpenseCreate) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

// Listar gastos (por edificio)
export const getExpenses = async (buildingId?: string) => {
  const res = await api.get("/expenses", {
    params: buildingId ? { building_id: buildingId } : undefined,
  });
  return res.data;
};

// Obtener gasto por ID
export const getExpense = async (id: string) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

// Editar gasto
export const updateExpense = async (id: string, data: ExpenseUpdate) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

// Eliminar gasto
export const deleteExpense = async (id: string) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

// Tipos de gasto (backend)
export const getExpenseTypes = async () => {
  const res = await api.get("/expenses/types/list");
  return res.data;
};
