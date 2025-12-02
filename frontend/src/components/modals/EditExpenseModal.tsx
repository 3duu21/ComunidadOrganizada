import React, { useState, useEffect } from "react";
import { updateExpense } from "../../services/expenses";

interface Props {
  expense: any;
  onClose: () => void;
}

const PAYMENT_OPTIONS = [
  "Transferencia",
  "Efectivo",
  "Tarjeta",
  "Cheque",
  "Caja chica",
];

export const EditExpenseModal: React.FC<Props> = ({ expense, onClose }) => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [typeExpense, setTypeExpense] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");

  useEffect(() => {
    setAmount(String(expense.amount ?? ""));
    setDescription(expense.description ?? "");
    setTypeExpense(expense.type_expense ?? "");
    setDate(expense.date ?? "");
    setPaymentMethod(expense.payment_method ?? "");
    setDocumentNumber(expense.document_number ?? "");
  }, [expense]);

  const handleSave = async () => {
    if (!typeExpense) return alert("Debe seleccionar un tipo de gasto");
    if (!date || !amount) return alert("Debe completar fecha y monto");

    try {
      await updateExpense(expense.id, {
        amount: Number(amount),
        description,
        type_expense: typeExpense,
        date,
        payment_method: paymentMethod || undefined,
        document_number: documentNumber || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Error editando gasto:", err);
      alert("No se pudo editar el gasto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Editar Gasto</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              className="w-full border p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de gasto
            </label>
            <select
              className="w-full border p-2 rounded"
              value={typeExpense}
              onChange={(e) => setTypeExpense(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              <option value="Remuneraciones y Gastos de Administracion">
                Remuneraciones y Gastos de Administracion
              </option>
              <option value="Gastos Generales y Gastos de uso y consumo">
                Gastos Generales y Gastos de uso y consumo
              </option>
              <option value="Gastos de Mantencion y Reparacion">
                Gastos de Mantencion y Reparacion
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Método de pago
            </label>
            <select
              className="w-full border p-2 rounded"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">No especificar</option>
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              N° documento
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>

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
