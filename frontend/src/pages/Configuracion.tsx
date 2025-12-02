// src/pages/Configuracion.tsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMe, updateSettings, MeSettings } from "../services/me";
import { getCondominiums, Condominium } from "../services/condominiums";

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<MeSettings>({});
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, condos] = await Promise.all([
          getMe(),
          getCondominiums(),
        ]);
        setSettings(me.settings || {});
        setCondominiums(condos || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof MeSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Configuración PROXIMAMENTE
        </h1>

        {loading ? (
          <p>Cargando configuración...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            {/* Condominio por defecto */}
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">
                Condominio por defecto
              </h2>
              <p className="text-xs text-gray-500 mb-2">
                Este será el condominio que se seleccionará por defecto al
                entrar al sistema.
              </p>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={settings.default_condominium_id || ""}
                onChange={(e) =>
                  handleChange(
                    "default_condominium_id",
                    e.target.value || null
                  )
                }
              >
                <option value="">Ninguno</option>
                {condominiums.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </section>

            {/* Notificaciones */}
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Notificaciones</h2>

              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={settings.notify_email ?? true}
                  onChange={(e) =>
                    handleChange("notify_email", e.target.checked)
                  }
                />
                <span>Recibir correos de resumen de gastos e ingresos.</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.notify_morosidad ?? true}
                  onChange={(e) =>
                    handleChange("notify_morosidad", e.target.checked)
                  }
                />
                <span>Recibir alertas de morosidad.</span>
              </label>
            </section>

            {/* Tema */}
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Apariencia</h2>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={(settings.theme || "dark") === "dark"}
                    onChange={(e) => handleChange("theme", e.target.value)}
                  />
                  <span>Tema oscuro</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={settings.theme === "light"}
                    onChange={(e) => handleChange("theme", e.target.value)}
                  />
                  <span>Tema claro</span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
