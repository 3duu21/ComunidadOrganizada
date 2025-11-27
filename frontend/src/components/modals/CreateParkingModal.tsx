// src/components/modals/CreateParkingModal.tsx
import { useState } from "react";
import { createParking } from "../../services/parkings";

interface Props {
  condominiumId: string;
  buildingId: string;
  departmentId: string;
  onClose: () => void;
}

export default function CreateParkingModal({
  condominiumId,
  buildingId,
  departmentId,
  onClose,
}: Props) {
  const [number, setNumber] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!number.trim()) {
      setErrorMsg("El número de estacionamiento es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      await createParking({
        number: number.trim(),
        condominium_id: condominiumId,
        building_id: buildingId,
        department_id: departmentId,
        monthly_price: monthlyPrice ? Number(monthlyPrice) : undefined,
      });

      onClose();
    } catch (err: any) {
      console.error("Error creando estacionamiento:", err);

      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (
        typeof backendMsg === "string" &&
        backendMsg
          .toLowerCase()
          .includes("este estacionamiento ya está ocupado")
      ) {
        setErrorMsg("Este estacionamiento ya está ocupado en este condominio.");
      } else if (typeof backendMsg === "string") {
        setErrorMsg(backendMsg);
      } else {
        setErrorMsg("Ocurrió un error al crear el estacionamiento.");
      }

      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Crear Estacionamiento
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
              className="w-full border rounded px-3 py-2"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto mensual (opcional)
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

          <p className="text-xs text-gray-500">
            Este estacionamiento quedará asociado al departamento seleccionado.
          </p>

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
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
