// src/components/modals/EditParkingModal.tsx
import { useState } from "react";
import { Parking, updateParking } from "../../services/parkings";

interface Props {
  parking: Parking;
  onClose: () => void;
}

type ParkingErrors = {
  number?: string;
  monthlyPrice?: string;
};

export function EditParkingModal({ parking, onClose }: Props) {
  const [number, setNumber] = useState(parking.number);
  const [monthlyPrice, setMonthlyPrice] = useState<string>(
    parking.monthly_price != null ? String(parking.monthly_price) : ""
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ParkingErrors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = () => {
    const newErrors: ParkingErrors = {};
    const trimmedNumber = number.trim();

    if (!trimmedNumber) {
      newErrors.number = "El número de estacionamiento es obligatorio.";
    } else if (trimmedNumber.length > 10) {
      newErrors.number = "El número no puede superar los 10 caracteres.";
    }

    if (monthlyPrice !== "") {
      const numericPrice = Number(monthlyPrice);
      if (isNaN(numericPrice)) {
        newErrors.monthlyPrice = "El monto mensual debe ser numérico.";
      } else if (numericPrice < 0) {
        newErrors.monthlyPrice = "El monto mensual no puede ser negativo.";
      } else if (numericPrice > 999999999) {
        newErrors.monthlyPrice = "El monto mensual es demasiado alto.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (saving) return;
    if (!validate()) return;

    try {
      setSaving(true);
      await updateParking(parking.id, {
        number: number.trim(),
        monthly_price: monthlyPrice ? Number(monthlyPrice) : null,
      });
      onClose();
    } catch (err: any) {
      console.error("Error actualizando estacionamiento:", err);

      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (typeof backendMsg === "string") {
        setErrorMsg(backendMsg);
      } else {
        setErrorMsg("Ocurrió un error al actualizar el estacionamiento.");
      }

      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Editar Estacionamiento
        </h3>

        {errorMsg && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              N° Estacionamiento
            </label>
            <input
              type="text"
              className={`w-full border rounded px-3 py-2 ${
                errors.number ? "border-red-400" : "border-gray-300"
              }`}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={saving}
              maxLength={10}
              placeholder="Ej: E-12"
            />
            {errors.number && (
              <p className="text-xs text-red-600 mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto mensual
            </label>
            <input
              type="number"
              className={`w-full border rounded px-3 py-2 ${
                errors.monthlyPrice ? "border-red-400" : "border-gray-300"
              }`}
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              disabled={saving}
              min={0}
              step="0.01"
              max={999999999}
            />
            {errors.monthlyPrice && (
              <p className="text-xs text-red-600 mt-1">
                {errors.monthlyPrice}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
