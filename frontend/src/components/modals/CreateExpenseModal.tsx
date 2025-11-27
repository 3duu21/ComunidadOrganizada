import React, { useState } from "react";
import { createExpense } from "../../services/expenses";

interface Props {
  buildingId?: string; // debe ser un UUID válido
  onClose: () => void;
}

const CreateExpenseModal: React.FC<Props> = ({ onClose, buildingId }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [typeExpense, setTypeExpense] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buildingId) {
      alert("Debe seleccionar un edificio válido.");
      return;
    }

    const payload = {
      amount: Number(amount),
      description,
      type_expense: typeExpense,
      building_id: buildingId,
      date,
    };

    try {
      setLoading(true);
      await createExpense(payload);
      onClose(); // cerrar modal
    } catch (err) {
      console.error("Error creando gasto:", err);
      alert("No se pudo crear el gasto. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Agregar Gasto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full border p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tipo gasto */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de gasto</label>
            <select
              className="w-full border p-2 rounded"
              value={typeExpense}
              onChange={(e) => setTypeExpense(e.target.value)}
              required
            >
              <option value="">Seleccionar…</option>
              <option value="Remuneraciones y Gastos de Administracion">Remuneraciones y Gastos de Administracion</option>
              <option value="Gastos Generales y Gastos de uso y consumo">Gastos Generales y Gastos de uso y consumo</option>
              <option value="Gastos de Mantencion y Reparacion">Gastos de Mantencion y Reparacion</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpenseModal;
