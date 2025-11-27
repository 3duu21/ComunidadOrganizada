import { useState } from "react";
import { deleteDepartment } from "../../services/departments";

interface Props {
  department: any;
  onClose: () => void;
}

export default function DeleteDepartmentModal({ department, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDepartment(department.id);
      onClose();
    } catch (err) {
      console.error("Error eliminando departamento:", err);
      alert("Error eliminando departamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4">Eliminar Departamento</h3>
        <p>¿Está seguro que desea eliminar el departamento <strong>{department.number}</strong> del piso <strong>{department.floor}</strong>?</p>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
