import { useState } from "react";
import { updateBuilding } from "../../services/buildings";

interface EditBuildingModalProps {
  building: any;
  onClose: () => void;
}

type BuildingErrors = {
  name?: string;
};

export function EditBuildingModal({
  building,
  onClose,
}: EditBuildingModalProps) {
  const [name, setName] = useState(building.name);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<BuildingErrors>({});

  const validate = () => {
    const newErrors: BuildingErrors = {};
    const trimmed = name.trim();

    if (!trimmed) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (trimmed.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres.";
    } else if (trimmed.length > 80) {
      newErrors.name = "El nombre no puede superar los 80 caracteres.";
    } else if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(trimmed)) {
      newErrors.name = "El nombre debe contener letras.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);
      await updateBuilding(building.id, { name: name.trim() });
      onClose();
    } catch (err) {
      console.error("Error actualizando edificio:", err);
      alert("No se pudo actualizar el edificio. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Editar Edificio</h2>

        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          className={`border p-2 w-full mb-2 rounded ${
            errors.name ? "border-red-400" : "border-gray-300"
          }`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          maxLength={80}
          placeholder="Ej: Torre A, Edificio Los Álamos"
        />
        {errors.name && (
          <p className="text-xs text-red-600 mb-2">{errors.name}</p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-60"
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
