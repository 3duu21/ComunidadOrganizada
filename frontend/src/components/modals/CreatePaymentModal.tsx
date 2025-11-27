import { useEffect, useState } from "react";
import { createPayment } from "../../services/payments";
import { getDepartments } from "../../services/departments";
import { Department } from "../types/Department";

interface CreatePaymentModalProps {
  buildingId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function CreatePaymentModal({
  buildingId,
  onClose,
  onRefresh,
}: CreatePaymentModalProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!buildingId) return;
    getDepartments(buildingId).then((res) => setDepartments(res));
  }, [buildingId]);

  const submit = async () => {
    await createPayment({
      building_id: buildingId,
      department_id: departmentId,
      amount: Number(amount),
      description,
      date,
    });

    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-3">Crear ingreso</h2>

        <label>Departamento</label>
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

        <label>Monto</label>
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
            onClick={submit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
