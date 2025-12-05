import { useState, useEffect } from "react";
import { updateDepartment } from "../../services/departments";

interface Props {
  department: any;
  onClose: () => void;
}

type DepartmentErrors = {
  floor?: string;
  number?: string;
  ownerName?: string;
  ownerEmail?: string;
};

export function EditDepartmentModal({ department, onClose }: Props) {
  const [floor, setFloor] = useState<number | "">("");
  const [number, setNumber] = useState<string>("");

  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerEmail, setOwnerEmail] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<DepartmentErrors>({});

  useEffect(() => {
    if (department) {
      setFloor(department.floor ?? "");
      setNumber(department.number ?? "");
      setOwnerName(department.owner_name ?? "");
      setOwnerEmail(department.owner_email ?? "");
    }
  }, [department]);

  const validate = () => {
    const newErrors: DepartmentErrors = {};
    const floorValue =
      floor === "" || Number.isNaN(Number(floor)) ? null : Number(floor);
    const numberTrimmed = number.trim();
    const ownerNameTrimmed = ownerName.trim();
    const ownerEmailTrimmed = ownerEmail.trim();

    if (floorValue === null) {
      newErrors.floor = "El piso es obligatorio.";
    } else if (!Number.isInteger(floorValue)) {
      newErrors.floor = "El piso debe ser un número entero.";
    } else if (floorValue < 0) {
      newErrors.floor = "El piso no puede ser negativo.";
    } else if (floorValue > 200) {
      newErrors.floor = "El piso es demasiado alto.";
    }

    if (!numberTrimmed) {
      newErrors.number = "El número es obligatorio.";
    } else if (numberTrimmed.length < 1) {
      newErrors.number = "El número debe tener al menos 1 carácter.";
    } else if (numberTrimmed.length > 10) {
      newErrors.number = "El número no puede superar los 10 caracteres.";
    }

    if (ownerNameTrimmed && ownerNameTrimmed.length > 80) {
      newErrors.ownerName = "El nombre del propietario es demasiado largo.";
    }

    if (ownerEmailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ownerEmailTrimmed)) {
        newErrors.ownerEmail = "El correo del propietario no es válido.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      await updateDepartment(department.id, {
        floor: Number(floor),
        number: number.trim(),
        owner_name: ownerName.trim() || undefined,
        owner_email: ownerEmail.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Error actualizando departamento:", err);
      alert("Error actualizando departamento, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Editar Departamento</h3>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Piso</label>
          <input
            type="number"
            className={`w-full border p-2 rounded ${
              errors.floor ? "border-red-400" : "border-gray-300"
            }`}
            value={floor}
            onChange={(e) => {
              const val = e.target.value;
              setFloor(val === "" ? "" : Number(val));
            }}
            min={0}
            max={200}
          />
          {errors.floor && (
            <p className="text-xs text-red-600 mt-1">{errors.floor}</p>
          )}
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Número</label>
          <input
            type="text"
            className={`w-full border p-2 rounded ${
              errors.number ? "border-red-400" : "border-gray-300"
            }`}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            maxLength={10}
          />
          {errors.number && (
            <p className="text-xs text-red-600 mt-1">{errors.number}</p>
          )}
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Propietario</label>
          <input
            type="text"
            className={`w-full border p-2 rounded ${
              errors.ownerName ? "border-red-400" : "border-gray-300"
            }`}
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Nombre del dueño (opcional)"
            maxLength={80}
          />
          {errors.ownerName && (
            <p className="text-xs text-red-600 mt-1">{errors.ownerName}</p>
          )}
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">
            Correo del propietario
          </label>
          <input
            type="email"
            className={`w-full border p-2 rounded ${
              errors.ownerEmail ? "border-red-400" : "border-gray-300"
            }`}
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="correo@ejemplo.com (opcional)"
            maxLength={100}
          />
          {errors.ownerEmail && (
            <p className="text-xs text-red-600 mt-1">{errors.ownerEmail}</p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
