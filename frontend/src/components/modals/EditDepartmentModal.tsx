import { useState, useEffect } from "react";
import { updateDepartment } from "../../services/departments";

interface Props {
  department: any;
  onClose: () => void;
}

export function EditDepartmentModal({ department, onClose }: Props) {
  const [floor, setFloor] = useState<number | "">("");
  const [number, setNumber] = useState<string>("");

  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerEmail, setOwnerEmail] = useState<string>("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setFloor(department.floor ?? "");
      setNumber(department.number ?? "");
      setOwnerName(department.owner_name ?? "");
      setOwnerEmail(department.owner_email ?? "");
    }
  }, [department]);

  const handleSubmit = async () => {
    if (floor === "" || !number) {
      return alert("Completa piso y número");
    }

    if (ownerEmail && !ownerEmail.includes("@")) {
      return alert("El correo del propietario no es válido");
    }

    setLoading(true);
    try {
      await updateDepartment(department.id, {
        floor: Number(floor),
        number,
        owner_name: ownerName || undefined,
        owner_email: ownerEmail || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Error actualizando departamento:", err);
      alert("Error actualizando departamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4">Editar Departamento</h3>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Piso</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={floor}
            onChange={(e) => {
              const val = e.target.value;
              setFloor(val === "" ? "" : Number(val));
            }}
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

        <div className="mb-3">
          <label className="block mb-1 font-medium">Propietario</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Nombre del dueño (opcional)"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Correo del propietario</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="correo@ejemplo.com (opcional)"
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
