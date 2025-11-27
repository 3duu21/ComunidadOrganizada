import { useState } from "react";
import { createDepartment } from "../../services/departments";

interface Props {
  buildingId?: string;
  onClose: () => void;
}

export default function CreateDepartmentModal({ buildingId, onClose }: Props) {
  const [floor, setFloor] = useState<number | "">("");
  const [number, setNumber] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!floor || !number || !buildingId) return alert("Complete todos los campos");

    setLoading(true);
    try {
      await createDepartment({ floor, number, building_id: buildingId });
      onClose();
    } catch (err) {
      console.error("Error creando departamento:", err);
      alert("Error creando departamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4">Crear Departamento</h3>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Piso</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Número</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
