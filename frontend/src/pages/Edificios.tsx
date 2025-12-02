import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import CreateBuildingModal from "../components/modals/CreateBuildingModal";
import { EditBuildingModal } from "../components/modals/EditBuildingModal";
import DeleteBuildingModal from "../components/modals/DeleteBuildingModal";
import { getBuildings } from "../services/buildings";
import api from "../services/api";

interface Condominium {
  id: string;
  name: string;
}

export default function Edificios() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState<string>("");
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
  };

  // Traer condominios y setear uno por defecto
  const loadCondominiums = async () => {
    try {
      setLoading(true);
      const res = await api.get("/condominiums");
      const data: Condominium[] = res.data;
      setCondominiums(data);

      if (data.length > 0) {
        // Por defecto, usamos el primer condominio del usuario
        const defaultCondoId = data[0].id;
        setSelectedCondoId(defaultCondoId);
        await loadBuildingsData(defaultCondoId);
      } else {
        setBuildings([]);
      }
    } catch (err) {
      console.error("Error cargando condominios:", err);
      setCondominiums([]);
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  // Traer edificios filtrados por condominio (OBLIGATORIO condoId)
  const loadBuildingsData = async (condoId: string) => {
    if (!condoId) {
      // si por alguna razón llega vacío, no llamamos al backend
      setBuildings([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getBuildings(condoId);

      // Ordenar por nombre de menor a mayor
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));

      setBuildings(data);
    } catch (err) {
      console.error("Error cargando edificios:", err);
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
    // ❌ quitamos loadBuildingsData() sin parámetro
  }, []);

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);

    if (cId) {
      loadBuildingsData(cId);
    } else {
      // Si decides dejar la opción "Todos", que no llame al backend
      setBuildings([]);
    }
  };

  const handleEdit = (building: any) => {
    setSelectedBuilding(building);
    setOpenEditModal(true);
  };

  const handleDelete = (building: any) => {
    setSelectedBuilding(building);
    setOpenDeleteModal(true);
  };

  const totalCount = buildings.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Edificios</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los edificios asociados a cada condominio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2"
              disabled={!selectedCondoId}
            >
              ➕ Agregar Edificio
            </button>
          </div>
        </div>

        {/* Filtros en tarjeta */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condominio */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Condominio
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedCondoId}
                onChange={handleCondoChange}
              >
                {/* Si NO quieres "Todos", puedes quitar esta opción */}
                <option value="">Seleccione un condominio</option>
                {condominiums.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chips de filtros activos */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded-full bg-gray-100 border">
              Condominio:{" "}
              <span className="font-semibold text-gray-700">
                {filters.condominiumName}
              </span>
            </span>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Edificios
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total de edificios listados según el filtro.
            </p>
          </div>
        </div>

        {/* Tabla de edificios */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando edificios...</p>
          ) : buildings.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay edificios para los filtros seleccionados.
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
                {buildings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
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
        {openCreateModal && selectedCondoId && (
          <CreateBuildingModal
            condominiumId={selectedCondoId}
            onClose={() => {
              setOpenCreateModal(false);
              loadBuildingsData(selectedCondoId);
            }}
          />
        )}

        {openEditModal && (
          <EditBuildingModal
            building={selectedBuilding}
            onClose={() => {
              setOpenEditModal(false);
              loadBuildingsData(selectedCondoId);
            }}
          />
        )}

        {openDeleteModal && (
          <DeleteBuildingModal
            building={selectedBuilding}
            onClose={() => {
              setOpenDeleteModal(false);
              loadBuildingsData(selectedCondoId);
            }}
          />
        )}
      </main>
    </div>
  );
}
