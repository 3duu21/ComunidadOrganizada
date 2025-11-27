import { useState } from "react";
import { updateBuilding } from "../../services/buildings";

interface EditBuildingModalProps {
  building: any;
  onClose: () => void;
}

export function EditBuildingModal({ building, onClose }: EditBuildingModalProps) {
  const [name, setName] = useState(building.name);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      await updateBuilding(building.id, { name });
      onClose();
    } catch (err) {
      console.error("Error actualizando edificio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Editar Edificio</h2>
        <label>Nombre</label>
        <input
          type="text"
          className="border p-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
