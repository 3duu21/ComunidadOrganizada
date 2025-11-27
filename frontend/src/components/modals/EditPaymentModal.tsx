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
}

interface EditPaymentModalProps {
  payment: Payment;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditPaymentModal({
  payment,
  onClose,
  onRefresh,
}: EditPaymentModalProps) {
  const [departmentId, setDepartmentId] = useState<string | undefined>(payment.department_id);
  const [amount, setAmount] = useState<number>(payment.amount);
  const [description, setDescription] = useState<string>(payment.description);
  const [date, setDate] = useState<string>(payment.date);
  const [departments, setDepartments] = useState<Department[]>([]);

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

    try {
      await updatePayment(payment.id, {
        department_id: departmentId,
        amount,
        description,
        date,
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error actualizando pago:", err);
      alert("Ocurrió un error al actualizar el pago.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Editar ingreso</h2>

        <label>Departamento</label>
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

        <label>Monto</label>
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <label>Fecha</label>
        <input
          type="date"
          className="border p-2 w-full mb-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Descripción</label>
        <textarea
          className="border p-2 w-full mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={submit}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
