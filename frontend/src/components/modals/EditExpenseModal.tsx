import React, { useState, useEffect } from "react";
import { updateExpense } from "../../services/expenses";

interface Props {
  expense: any;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<Props> = ({ expense, onClose }) => {
  const [amount, setAmount] = useState(expense.amount);
  const [description, setDescription] = useState(expense.description);
  const [typeExpense, setTypeExpense] = useState(expense.type_expense || "");
  const [date, setDate] = useState(expense.date);

  useEffect(() => {
    // Aseguramos que si cambia el expense seleccionado se actualicen los campos
    setAmount(expense.amount);
    setDescription(expense.description);
    setTypeExpense(expense.type_expense || "");
    setDate(expense.date);
  }, [expense]);

  const handleSave = async () => {
    if (!typeExpense) return alert("Debe seleccionar un tipo de gasto");
    try {
      await updateExpense(expense.id, {
        amount: Number(amount),
        description,
        type_expense: typeExpense, // ⚡ nombre exacto que espera tu backend
        date,
      });
      onClose();
    } catch (err) {
      console.error("Error editando gasto:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Editar Gasto</h2>

        <div className="space-y-4">
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={typeExpense}
            onChange={(e) => setTypeExpense(e.target.value)}
          >
            <option value="">Seleccionar…</option>
            <option value="Mantención">Mantención</option>
            <option value="Reparación">Reparación</option>
            <option value="Administración">Administración</option>
          </select>

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
