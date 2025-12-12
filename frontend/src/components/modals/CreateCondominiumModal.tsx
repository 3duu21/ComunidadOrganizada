import { useState } from "react";
import { createCondominium } from "../../services/condominiums";

interface Props {
  onClose: () => void;
}

type CondoErrors = {
  name?: string;
};

export default function CreateCondominiumModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<CondoErrors>({});
  const [apiError, setApiError] = useState<string | null>(null); // 👈 error desde backend

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

    // limpiamos errores previos
    setApiError(null);

    if (!validate()) return;

    try {
      setSaving(true);
      await createCondominium({ name: name.trim() });
      onClose();
    } catch (err: any) {
      console.error("Error creando condominio:", err);

      // Intentar leer el mensaje amigable del backend
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      // Si el mensaje viene desde nuestros BadRequestException por plan
      // lo mostramos tal cual, sino mostramos algo genérico
      if (backendMessage) {
        setApiError(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo crear el condominio. Revisa tu plan o intenta nuevamente."
        );
      } else {
        setApiError(
          "No se pudo crear el condominio. Revisa tu plan o intenta nuevamente."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Crear Condominio</h3>

        {/* Mensaje de error de API / plan */}
        {apiError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <p className="font-semibold">No se pudo crear el condominio</p>
            <p className="mt-1">{apiError}</p>
            <p className="mt-1 text-xs text-red-700">
              Si ya alcanzaste el límite de tu plan y necesitas administrar más
              condominios, contáctanos para mejorar tu plan.
            </p>
          </div>
        )}

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
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
