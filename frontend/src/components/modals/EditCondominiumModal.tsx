import { useState } from "react";
import { Condominium, updateCondominium } from "../../services/condominiums";

interface Props {
  condominium: Condominium;
  onClose: () => void;
}

type CondoErrors = {
  name?: string;
};

export function EditCondominiumModal({ condominium, onClose }: Props) {
  const [name, setName] = useState(condominium.name);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<CondoErrors>({});

  const validate = () => {
    const newErrors: CondoErrors = {};
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!validate()) return;

    try {
      setSaving(true);
      await updateCondominium(condominium.id, { name: name.trim() });
      onClose();
    } catch (err) {
      console.error("Error actualizando condominio:", err);
      alert("No se pudo actualizar el condominio. Intenta nuevamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Editar Condominio</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              className={`w-full border rounded px-3 py-2 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              maxLength={80}
              placeholder="Ej: Condominio Los Álamos"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
