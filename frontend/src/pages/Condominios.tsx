import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Condominium,
  getCondominiums,
} from "../services/condominiums";
import CreateCondominiumModal from "../components/modals/CreateCondominiumModal";
import { EditCondominiumModal } from "../components/modals/EditCondominiumModal";
import DeleteCondominiumModal from "../components/modals/DeleteCondominiumModal";

export default function Condominios() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condominium | null>(null);

  const loadCondominiumsData = async () => {
    try {
      setLoading(true);
      const data = await getCondominiums(); // 👈 ya llama a /condominiums/my

      // ordenar por nombre
      data.sort((a, b) => a.name.localeCompare(b.name));

      setCondominiums(data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
      setCondominiums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 👇 usamos la función que ya tienes
    loadCondominiumsData();
  }, []);

  const handleEdit = (condo: Condominium) => {
    setSelectedCondo(condo);
    setOpenEditModal(true);
  };

  const handleDelete = (condo: Condominium) => {
    setSelectedCondo(condo);
    setOpenDeleteModal(true);
  };

  const totalCount = condominiums.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Condominios</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los distintos condominios que forman parte del sistema.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              ➕ Agregar Condominio
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Condominios
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total de condominios registrados en la plataforma.
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando condominios...</p>
          ) : condominiums.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay condominios registrados aún. Crea el primero con el botón
              &quot;Agregar Condominio&quot;.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {condominiums.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑 Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modales */}
        {openCreateModal && (
          <CreateCondominiumModal
            onClose={() => {
              setOpenCreateModal(false);
              loadCondominiumsData();
            }}
          />
        )}

        {openEditModal && selectedCondo && (
          <EditCondominiumModal
            condominium={selectedCondo}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedCondo(null);
              loadCondominiumsData();
            }}
          />
        )}

        {openDeleteModal && selectedCondo && (
          <DeleteCondominiumModal
            condominium={selectedCondo}
            onClose={() => {
              setOpenDeleteModal(false);
              setSelectedCondo(null);
              loadCondominiumsData();
            }}
          />
        )}
      </main>
    </div>
  );
}
