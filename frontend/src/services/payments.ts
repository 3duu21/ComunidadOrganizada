import api from "./api";

// Listar pagos, opcionalmente por edificio y condominio
export const getPayments = async (buildingId?: string, condoId?: string) => {
  const params: any = {};
  if (buildingId) params.building_id = buildingId;
  if (condoId) params.condominium_id = condoId;

  const res = await api.get("/payments", { params });
  return res.data;
};

// Crear pago
export const createPayment = async (data: any) => {
  const res = await api.post("/payments", data);
  return res.data;
};

// Editar pago
export const updatePayment = async (id: string, data: any) => {
  const res = await api.put(`/payments/${id}`, data);
  return res.data;
};

// Eliminar pago
export const deletePayment = async (id: string) => {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
};
