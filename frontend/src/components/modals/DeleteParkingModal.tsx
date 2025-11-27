// src/components/modals/DeleteParkingModal.tsx
import { Parking, deleteParking } from "../../services/parkings";
import { useState } from "react";

interface Props {
  parking: Parking;
  onClose: () => void;
}

export default function DeleteParkingModal({ parking, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteParking(parking.id);
      onClose();
    } catch (err) {
      console.error("Error eliminando estacionamiento:", err);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          Eliminar Estacionamiento
        </h3>
        <p className="mb-4">
          ¿Estás seguro que deseas eliminar el estacionamiento{" "}
          <span className="font-semibold">{parking.number}</span>?
        </p>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
