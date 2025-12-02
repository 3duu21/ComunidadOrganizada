// src/components/modals/EditPaymentModal.tsx
import { useEffect, useState } from "react";
import { updatePayment } from "../../services/payments";
import { getDepartments } from "../../services/departments";
import { Department } from "../types/Department";

interface Payment {
  id: string;
  building_id: string;
  department_id?: string;
  amount: number;
  description: string;
  date: string;
  payment_method?: string;
  document_number?: string;
}

interface EditPaymentModalProps {
  payment: Payment;
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

export function EditPaymentModal({
  payment,
  onClose,
  onRefresh,
}: EditPaymentModalProps) {
  const [departmentId, setDepartmentId] = useState<string | undefined>(
    payment.department_id
  );
  const [amount, setAmount] = useState<string>(String(payment.amount));
  const [description, setDescription] = useState<string>(payment.description);
  const [date, setDate] = useState<string>(payment.date);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    payment.payment_method || ""
  );
  const [documentNumber, setDocumentNumber] = useState<string>(
    payment.document_number || ""
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar departamentos del edificio
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res: Department[] = await getDepartments(payment.building_id);
        setDepartments(res);
      } catch (err) {
        console.error("Error cargando departamentos:", err);
      }
    };

    if (payment.building_id) {
      loadDepartments();
    }
  }, [payment.building_id]);

  const submit = async () => {
    if (!departmentId) {
      alert("Debe seleccionar un departamento");
      return;
    }
    if (!amount || !date) {
      alert("Debe completar monto y fecha");
      return;
    }

    try {
      setLoading(true);
      await updatePayment(payment.id, {
        department_id: departmentId,
        amount: Number(amount),
        description,
        date,
        payment_method: paymentMethod || undefined,
        document_number: documentNumber || undefined,
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error actualizando pago:", err);
      alert("Ocurrió un error al actualizar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Editar ingreso</h2>

        <label className="block text-sm font-medium mb-1">Departamento</label>
        <select
          className="border p-2 w-full mb-2"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              Piso {d.floor} - {d.number}
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
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose} disabled={loading}>
            Cancelar
          </button>

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
