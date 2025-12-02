// src/services/payments.ts
import api from "./api";

export interface PaymentCreate {
  building_id: string;
  department_id: string;
  amount: number;
  description?: string;
  date: string;
  payment_method?: string;
  document_number?: string;
}

export interface PaymentUpdate extends Partial<PaymentCreate> {}

// Listar pagos, opcionalmente por edificio y condominio
export const getPayments = async (buildingId?: string, condoId?: string) => {
  const params: any = {};
  if (buildingId) params.building_id = buildingId;
  if (condoId) params.condominium_id = condoId;

  const res = await api.get("/payments", { params });
  return res.data;
};

// Crear pago
export const createPayment = async (data: PaymentCreate) => {
  const res = await api.post("/payments", data);
  return res.data;
};

// Editar pago
export const updatePayment = async (id: string, data: PaymentUpdate) => {
  const res = await api.put(`/payments/${id}`, data);
  return res.data;
};

// Eliminar pago
export const deletePayment = async (id: string) => {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
};
