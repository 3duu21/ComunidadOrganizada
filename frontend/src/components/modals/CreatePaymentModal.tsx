// src/components/modals/CreatePaymentModal.tsx
import { useEffect, useState } from "react";
import { createPayment } from "../../services/payments";
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

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!buildingId) return;
    getDepartments(buildingId).then((res) => setDepartments(res));
  }, [buildingId]);

  const submit = async () => {
    if (!departmentId || !amount || !date) {
      alert("Debe completar departamento, monto y fecha");
      return;
    }

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
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error creando pago:", err);
      alert("Ocurrió un error al crear el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-3">Crear ingreso</h2>

        <label className="block text-sm font-medium mb-1">Departamento</label>
        <select
          className="border p-2 w-full mb-2"
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

        <label className="block text-sm font-medium mb-1">Monto</label>
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          className="border p-2 w-full mb-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          className="border p-2 w-full mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">
          Método de pago
        </label>
        <select
          className="border p-2 w-full mb-2"
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
          className="border p-2 w-full mb-3"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          placeholder="Ej: TRX-12345"
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={submit}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
