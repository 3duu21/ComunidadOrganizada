// src/components/modals/CreatePaymentModal.tsx
import { useEffect, useState } from "react";
import { createPayment, getPaymentTypes } from "../../services/payments";
import { getDepartments } from "../../services/departments";
import { Department } from "../types/Department";

interface CreatePaymentModalProps {
  buildingId: string;
  onClose: () => void;
  onRefresh: () => void;
}

const PAYMENT_OPTIONS = [
  "Transferencia",
  "Efectivo",
  "Tarjeta",
  "Cheque",
  "Caja chica",
];

type PaymentErrors = {
  building?: string;
  department?: string;
  amount?: string;
  date?: string;
  documentNumber?: string;
};

export default function CreatePaymentModal({
  buildingId,
  onClose,
  onRefresh,
}: CreatePaymentModalProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // tipo de ingreso
  const [typeIncome, setTypeIncome] = useState("");
  const [incomeTypes, setIncomeTypes] = useState<string[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PaymentErrors>({});

  useEffect(() => {
    if (!buildingId) return;
    getDepartments(buildingId).then((res) => setDepartments(res));
  }, [buildingId]);

  // Cargar tipos de ingreso desde backend
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await getPaymentTypes();
        setIncomeTypes(types);
      } catch (err) {
        console.error("Error cargando tipos de ingreso:", err);
      }
    };
    loadTypes();
  }, []);

  const validate = () => {
    const newErrors: PaymentErrors = {};

    if (!buildingId) {
      newErrors.building = "Debe seleccionar un edificio válido antes de registrar ingresos.";
    }

    if (!departmentId) {
      newErrors.department = "Debe seleccionar un departamento.";
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

    if (!date) {
      newErrors.date = "La fecha es obligatoria.";
    } else {
      const today = new Date();
      const selected = new Date(date);
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

  const submit = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);
      await createPayment({
        building_id: buildingId,
        department_id: departmentId,
        amount: Number(amount),
        description: description || undefined,
        date,
        payment_method: paymentMethod || undefined,
        document_number: documentNumber || undefined,
        type_income: typeIncome || undefined,
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error creando pago:", err);
      alert("Ocurrió un error al crear el pago."); // esto sí es algo más “grave”
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Crear ingreso</h2>

        {errors.building && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errors.building}
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Departamento</label>
        <select
          className={`border p-2 w-full mb-2 rounded ${
            errors.department ? "border-red-400" : "border-gray-300"
          }`}
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.number}
            </option>
          ))}
        </select>
        {errors.department && (
          <p className="text-xs text-red-600 mb-2">{errors.department}</p>
        )}

        <label className="block text-sm font-medium mb-1">Monto</label>
        <input
          type="number"
          className={`border p-2 w-full mb-2 rounded ${
            errors.amount ? "border-red-400" : "border-gray-300"
          }`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          step="0.01"
          max={999999999}
        />
        {errors.amount && (
          <p className="text-xs text-red-600 mb-2">{errors.amount}</p>
        )}

        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          className={`border p-2 w-full mb-2 rounded ${
            errors.date ? "border-red-400" : "border-gray-300"
          }`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && (
          <p className="text-xs text-red-600 mb-2">{errors.date}</p>
        )}

        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          className="border p-2 w-full mb-3 rounded border-gray-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={250}
        />
        <p className="text-[11px] text-gray-400 -mt-2 mb-2">
          Máx. 250 caracteres.
        </p>

        {/* Tipo de ingreso */}
        <label className="block text-sm font-medium mb-1">
          Tipo de ingreso
        </label>
        <select
          className="border p-2 w-full mb-2 rounded border-gray-300"
          value={typeIncome}
          onChange={(e) => setTypeIncome(e.target.value)}
        >
          <option value="">No especificar</option>
          {incomeTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">
          Método de pago
        </label>
        <select
          className="border p-2 w-full mb-2 rounded border-gray-300"
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

        <label className="block text-sm font-medium mb-1">N° documento</label>
        <input
          type="text"
          className={`border p-2 w-full mb-3 rounded ${
            errors.documentNumber ? "border-red-400" : "border-gray-300"
          }`}
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          placeholder="Ej: TRX-12345"
        />
        {errors.documentNumber && (
          <p className="text-xs text-red-600 mb-2">{errors.documentNumber}</p>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={submit}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
