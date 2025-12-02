import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import CreateDepartmentModal from "../components/modals/CreateDepartmentModal";
import { EditDepartmentModal } from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";
import api from "../services/api";

interface Condominium {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
}

export default function Departamentos() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState<string>("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
    buildingName:
      buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
  };

  // Cargar condominios
  const loadCondominiums = async () => {
    try {
      const res = await api.get("/condominiums");
      setCondominiums(res.data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
    }
  };

  // Cargar edificios, opcionalmente filtrando por condominio
  const loadBuildings = async (condoId?: string) => {
    try {
      const res = await api.get("/buildings", {
        params: condoId ? { condominium_id: condoId } : undefined,
      });
      setBuildings(res.data);
    } catch (err) {
      console.error("Error cargando edificios:", err);
    }
  };

  // Cargar departamentos, filtrando opcionalmente por edificio
  const loadDepartments = async (buildingId?: string) => {
    try {
      setLoading(true);
      let data;
      if (buildingId && buildingId !== "") {
        data = await api
          .get(`/departments?building_id=${buildingId}`)
          .then((res) => res.data);
      } else {
        data = await api.get("/departments").then((res) => res.data);
      }

      const sorted = data.sort((a: any, b: any) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.number.localeCompare(b.number);
      });

      setDepartments(sorted);
    } catch (err) {
      console.error("Error cargando departamentos:", err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
    loadBuildings();
    loadDepartments();
  }, []);

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setDepartments([]);
    if (cId) {
      loadBuildings(cId);
    } else {
      setBuildings([]);
      loadDepartments(); // todos
    }
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);
    if (bId) {
      loadDepartments(bId);
    } else {
      loadDepartments(); // sin filtro de edificio
    }
  };

  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    setOpenEditModal(true);
  };

  const handleDelete = (department: any) => {
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  };

  const totalCount = departments.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Departamentos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los departamentos por condominio y edificio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2"
              disabled={!selectedBuildingId}
            >
              ➕ Agregar Departamento
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
                <option value="">Seleccione...</option>
                {condominiums.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Edificio */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Edificio
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedBuildingId}
                onChange={handleBuildingChange}
                disabled={!selectedCondoId && buildings.length === 0}
              >
                <option value="">Seleccione...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
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
            <span className="px-2 py-1 rounded-full bg-gray-100 border">
              Edificio:{" "}
              <span className="font-semibold text-gray-700">
                {filters.buildingName}
              </span>
            </span>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Departamentos
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total de departamentos listados según los filtros.
            </p>
          </div>
        </div>

        {/* Tabla de departamentos */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando departamentos...</p>
          ) : departments.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay departamentos para los filtros seleccionados.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Piso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dep) => (
                  <tr key={dep.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {dep.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {dep.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {dep.owner_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {dep.owner_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => handleEdit(dep)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(dep)}
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
          <CreateDepartmentModal
            buildingId={selectedBuildingId || undefined}
            onClose={() => {
              setOpenCreateModal(false);
              loadDepartments(selectedBuildingId || undefined);
            }}
          />
        )}

        {openEditModal && (
          <EditDepartmentModal
            department={selectedDepartment}
            onClose={() => {
              setOpenEditModal(false);
              loadDepartments(selectedBuildingId || undefined);
            }}
          />
        )}

        {openDeleteModal && (
          <DeleteDepartmentModal
            department={selectedDepartment}
            onClose={() => {
              setOpenDeleteModal(false);
              loadDepartments(selectedBuildingId || undefined);
            }}
          />
        )}
      </main>
    </div>
  );
}
