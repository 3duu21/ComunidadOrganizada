import { useState } from "react";
import { createBuilding } from "../../services/buildings";

interface CreateBuildingModalProps {
  condominiumId: string; // ⚡ Asegúrate de que siempre envías un id
  onClose: () => void;
}

type BuildingErrors = {
  name?: string;
  condominium?: string;
};

export default function CreateBuildingModal({
  condominiumId,
  onClose,
}: CreateBuildingModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<BuildingErrors>({});
  const [apiError, setApiError] = useState<string | null>(null); // 👈 error desde backend

  const validate = () => {
    const newErrors: BuildingErrors = {};
    const trimmed = name.trim();

    if (!condominiumId) {
      newErrors.condominium =
        "Debe seleccionar un condominio válido antes de crear un edificio.";
    }

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
    setApiError(null); // limpiar mensaje previo

    if (!validate()) return;

    try {
      setLoading(true);
      await createBuilding({ name: name.trim(), condominium_id: condominiumId });
      onClose();
    } catch (err: any) {
      console.error("Error creando edificio:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (backendMessage) {
        setApiError(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo crear el edificio. Revisa tu plan o intenta nuevamente."
        );
      } else {
        setApiError(
          "No se pudo crear el edificio. Revisa tu plan o intenta nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Crear Edificio</h2>

        {/* Error de API / límite de plan */}
        {apiError && (
          <div className="mb-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">
            <p className="font-semibold">No se pudo crear el edificio</p>
            <p className="mt-1">{apiError}</p>
            <p className="mt-1 text-xs text-red-700">
              Si alcanzaste el límite de tu plan para edificios, contáctanos
              para mejorar tu plan y poder administrar más propiedades.
            </p>
          </div>
        )}

        {errors.condominium && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errors.condominium}
          </p>
        )}

        <label className="block text-sm font-medium mb-1">
          Nombre del edificio
        </label>
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
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
