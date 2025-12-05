import React, { useState } from "react";
import { createExpense } from "../../services/expenses";

interface Props {
  buildingId?: string; // debe ser un UUID válido
  onClose: () => void;
}

const PAYMENT_OPTIONS = [
  "Transferencia",
  "Efectivo",
  "Tarjeta",
  "Cheque",
  "Caja chica",
];

type ExpenseErrors = {
  building?: string;
  amount?: string;
  typeExpense?: string;
  date?: string;
  paymentMethod?: string;
  documentNumber?: string;
};

const CreateExpenseModal: React.FC<Props> = ({ onClose, buildingId }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [typeExpense, setTypeExpense] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ExpenseErrors>({});

  const validate = () => {
    const newErrors: ExpenseErrors = {};

    if (!buildingId) {
      newErrors.building = "Debe seleccionar un edificio válido antes de agregar gastos.";
    }

    const numericAmount = Number(amount);
    if (!amount) {
      newErrors.amount = "El monto es obligatorio.";
    } else if (isNaN(numericAmount)) {
      newErrors.amount = "El monto debe ser numérico.";
    } else if (numericAmount <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0.";
    } else if (numericAmount > 999999999) {
      newErrors.amount = "El monto es demasiado alto.";
    }

    if (!typeExpense) {
      newErrors.typeExpense = "Debe seleccionar un tipo de gasto.";
    }

    if (!date) {
      newErrors.date = "La fecha es obligatoria.";
    } else {
      const today = new Date();
      const selected = new Date(date);
      // Normalizamos horas para comparar solo día
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      if (selected > today) {
        newErrors.date = "La fecha no puede ser futura.";
      }
    }

    if (documentNumber && documentNumber.length > 30) {
      newErrors.documentNumber = "El número de documento es demasiado largo.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    const payload = {
      amount: Number(amount),
      description: description || undefined,
      type_expense: typeExpense,
      building_id: buildingId!, // validado arriba
      date,
      payment_method: paymentMethod || undefined,
      document_number: documentNumber || undefined,
    };

    try {
      setLoading(true);
      await createExpense(payload);
      onClose(); // cerrar modal
    } catch (err) {
      console.error("Error creando gasto:", err);
      // Error genérico para no detallar demasiado
      alert("No se pudo crear el gasto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Agregar Gasto</h2>

        {/* Error por edificio no seleccionado */}
        {errors.building && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errors.building}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <input
              type="number"
              className={`w-full border p-2 rounded ${errors.amount ? "border-red-400" : "border-gray-300"
                }`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="0.01"
            />
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full border p-2 rounded border-gray-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={250}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Máx. 250 caracteres.
            </p>
          </div>

          {/* Tipo gasto */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de gasto
            </label>
            <select
              className={`w-full border p-2 rounded ${errors.typeExpense ? "border-red-400" : "border-gray-300"
                }`}
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
            {errors.typeExpense && (
              <p className="text-xs text-red-600 mt-1">
                {errors.typeExpense}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              className={`w-full border p-2 rounded ${errors.date ? "border-red-400" : "border-gray-300"
                }`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Método de pago
            </label>
            <select
              className="w-full border p-2 rounded border-gray-300"
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

          {/* Número de documento */}
          <div>
            <label className="block text-sm font-medium mb-1">
              N° documento
            </label>
            <input
              type="text"
              className={`w-full border p-2 rounded ${errors.documentNumber ? "border-red-400" : "border-gray-300"
                }`}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ej: F-12345, B-5678"
            />
            {errors.documentNumber && (
              <p className="text-xs text-red-600 mt-1">
                {errors.documentNumber}
              </p>
            )}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
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
