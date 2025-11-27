import api from "./api";

export interface Parking {
  id: string;
  number: string;
  condominium_id?: string | null;
  building_id?: string | null;
  department_id?: string | null;
  is_rented: boolean;
  monthly_price?: number | null;
}

export const getParkings = async (): Promise<Parking[]> => {
  const res = await api.get("/parkings");
  return res.data;
};

export const getParkingsByDepartment = async (
  departmentId: string
): Promise<Parking[]> => {
  const res = await api.get("/parkings", {
    params: { departmentId },
  });
  return res.data;
};

export const createParking = async (payload: {
  number: string;
  condominium_id?: string | null;
  building_id?: string | null;
  department_id?: string | null;
  monthly_price?: number | null;
}) => {
  const res = await api.post("/parkings", payload);
  return res.data;
};

export const updateParking = async (
  id: string,
  payload: {
    number?: string;
    condominium_id?: string | null;
    building_id?: string | null;
    department_id?: string | null;
    monthly_price?: number | null;
    is_rented?: boolean;
  }
) => {
  const res = await api.patch(`/parkings/${id}`, payload);
  return res.data;
};

export const deleteParking = async (id: string) => {
  const res = await api.delete(`/parkings/${id}`);
  return res.data;
};
