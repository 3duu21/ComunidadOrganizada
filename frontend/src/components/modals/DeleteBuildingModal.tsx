import { useState } from "react";
import { deleteBuilding } from "../../services/buildings";

interface DeleteBuildingModalProps {
  building: any;
  onClose: () => void;
}

export default function DeleteBuildingModal({ building, onClose }: DeleteBuildingModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteBuilding(building.id);
      onClose();
    } catch (err) {
      console.error("Error eliminando edificio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Eliminar Edificio</h2>
        <p className="mb-4">¿Seguro quieres eliminar el edificio <strong>{building.name}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancelar</button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
