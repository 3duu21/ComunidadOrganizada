import React from "react";
import { deleteExpense } from "../../services/expenses";

interface Props {
  expense: any;
  onClose: () => void;
}

export const DeleteExpenseModal: React.FC<Props> = ({ expense, onClose }) => {
  const handleDelete = async () => {
    try {
      await deleteExpense(expense.id);
      onClose(); // refresca la lista
    } catch (err) {
      console.error("Error eliminando gasto:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Eliminar Gasto</h2>
        <p>¿Seguro quieres eliminar este gasto?</p>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Eliminar</button>
        </div>
      </div>
    </div>
  );
};
