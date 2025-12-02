// src/pages/Perfil.tsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMe, updateProfile, MeRole } from "../services/me";

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [globalRole, setGlobalRole] = useState("");
  const [roles, setRoles] = useState<MeRole[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getMe();
        setName(me.user.name || "");
        setEmail(me.user.email || "");
        setPhone(me.user.phone || "");
        setGlobalRole(me.user.role || "");
        setRoles(me.roles || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil</h1>

        {loading ? (
          <p>Cargando perfil...</p>
        ) : (
          <>
            {/* Datos básicos */}
            <section className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl">
              <h2 className="text-lg font-semibold mb-3">Datos personales</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El correo se usa como usuario de acceso.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Rol global
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                    value={globalRole}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rol dentro del sistema (ej: owner, user, support).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </section>

            {/* Roles por condominio */}
            <section className="bg-white rounded-lg shadow p-4 max-w-3xl">
              <h2 className="text-lg font-semibold mb-3">Mis roles por condominio</h2>
              {roles.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tienes condominios asignados aún.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-500 text-xs uppercase">
                          Condominio
                        </th>
                        <th className="px-4 py-2 text-left text-gray-500 text-xs uppercase">
                          Rol
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((r) => (
                        <tr key={r.condominium_id} className="border-t">
                          <td className="px-4 py-2 text-gray-700">
                            {r.condominium_name}
                          </td>
                          <td className="px-4 py-2 text-gray-700 capitalize">
                            {r.role}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
