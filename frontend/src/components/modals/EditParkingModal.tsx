// src/components/modals/EditParkingModal.tsx
import { useState } from "react";
import { Parking, updateParking } from "../../services/parkings";

interface Props {
  parking: Parking;
  onClose: () => void;
}

export function EditParkingModal({ parking, onClose }: Props) {
  const [number, setNumber] = useState(parking.number);
  const [monthlyPrice, setMonthlyPrice] = useState<string>(
    parking.monthly_price != null ? String(parking.monthly_price) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim()) return;

    try {
      setSaving(true);
      await updateParking(parking.id, {
        number: number.trim(),
        monthly_price: monthlyPrice ? Number(monthlyPrice) : null,
      });
      onClose();
    } catch (err) {
      console.error("Error actualizando estacionamiento:", err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Editar Estacionamiento
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              N° Estacionamiento
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto mensual
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              disabled={saving}
              min={0}
            />
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
