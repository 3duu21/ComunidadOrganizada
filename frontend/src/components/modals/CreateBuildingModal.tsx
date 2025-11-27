import { useState } from "react";
import { createBuilding } from "../../services/buildings";

interface CreateBuildingModalProps {
  condominiumId: string; // ⚡ Asegúrate de que siempre envías un id
  onClose: () => void;
}

export default function CreateBuildingModal({ condominiumId, onClose }: CreateBuildingModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      // ⚡ Usamos '!' para asegurarle a TS que nunca es undefined
      await createBuilding({ name, condominium_id: condominiumId });
      onClose();
    } catch (err) {
      console.error("Error creando edificio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Crear Edificio</h2>

        <label>Nombre del edificio</label>
        <input
          type="text"
          className="border p-2 w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={submit}
            disabled={loading || name.trim() === ""}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
