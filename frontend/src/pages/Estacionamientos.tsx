import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { getBuildings } from "../services/buildings";
import { getDepartments } from "../services/departments";
import {
  Parking,
  getParkings,
  getParkingsByDepartment,
} from "../services/parkings";
import CreateParkingModal from "../components/modals/CreateParkingModal";
import { EditParkingModal } from "../components/modals/EditParkingModal";
import DeleteParkingModal from "../components/modals/DeleteParkingModal";

interface Condominium {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
  condominium_id?: string;
}

interface Department {
  id: string;
  number: string;
  building_id?: string;
}

export default function Estacionamientos() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);

  const [selectedCondoId, setSelectedCondoId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);

  const formatCurrency = (value?: number | null) =>
    value != null ? `$${value.toLocaleString("es-CL")}` : "-";

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
    buildingName:
      buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
    departmentLabel:
      departments.find((d) => d.id === selectedDepartmentId)?.number || "—",
  };

  const loadCondominiums = async () => {
    try {
      const res = await api.get("/condominiums");
      setCondominiums(res.data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
    }
  };

  const loadBuildingsData = async (condoId?: string) => {
    try {
      if (!condoId) {
        setBuildings([]);
        return;
      }
      const data = await getBuildings(condoId);
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setBuildings(data);
    } catch (err) {
      console.error("Error cargando edificios:", err);
    }
  };

  const loadDepartmentsData = async (buildingId?: string) => {
    try {
      if (!buildingId) {
        setDepartments([]);
        return;
      }
      const data = await getDepartments(buildingId);
      data.sort((a: any, b: any) =>
        String(a.number).localeCompare(String(b.number))
      );
      setDepartments(data);
    } catch (err) {
      console.error("Error cargando departamentos:", err);
    }
  };

  const loadParkingsData = async (departmentId?: string) => {
    try {
      setLoading(true);
      let data: Parking[];
      if (departmentId) {
        data = await getParkingsByDepartment(departmentId);
      } else {
        data = await getParkings();
      }
      data.sort((a, b) => a.number.localeCompare(b.number));
      setParkings(data);
    } catch (err) {
      console.error("Error cargando estacionamientos:", err);
      setParkings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
    setLoading(false); // al inicio, sin datos filtrados pero sin spinner eterno
  }, []);

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setSelectedDepartmentId("");
    setBuildings([]);
    setDepartments([]);
    setParkings([]);
    if (cId) {
      loadBuildingsData(cId);
    }
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);
    setSelectedDepartmentId("");
    setDepartments([]);
    setParkings([]);
    if (bId) {
      loadDepartmentsData(bId);
    }
  };

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const dId = e.target.value;
    setSelectedDepartmentId(dId);
    if (dId) {
      loadParkingsData(dId);
    } else {
      setParkings([]);
    }
  };

  const handleEdit = (parking: Parking) => {
    setSelectedParking(parking);
    setOpenEditModal(true);
  };

  const handleDelete = (parking: Parking) => {
    setSelectedParking(parking);
    setOpenDeleteModal(true);
  };

  // Saber si el departamento seleccionado ya tiene estacionamiento
  const hasParkingForSelectedDept =
    !!selectedDepartmentId &&
    parkings.some((p) => p.department_id === selectedDepartmentId);

  const totalCount = parkings.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Estacionamientos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los estacionamientos por condominio, edificio y
              departamento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60"
              disabled={!selectedDepartmentId || hasParkingForSelectedDept}
            >
              ➕ Agregar Estacionamiento
            </button>
          </div>
        </div>

        {/* Filtros en tarjeta */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                disabled={!selectedCondoId}
              >
                <option value="">Seleccione...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Departamento
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                disabled={!selectedBuildingId}
              >
                <option value="">Seleccione...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.number}
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
            <span className="px-2 py-1 rounded-full bg-gray-100 border">
              Departamento:{" "}
              <span className="font-semibold text-gray-700">
                {filters.departmentLabel}
              </span>
            </span>
          </div>
        </div>

        {/* Mensaje cuando ya tiene estacionamiento */}
        {hasParkingForSelectedDept && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 text-sm text-red-700 bg-red-100 px-3 py-2 rounded border border-red-300">
              <span>⚠</span>
              <span>
                Este departamento ya tiene un estacionamiento asignado en este
                condominio.
              </span>
            </div>
          </div>
        )}

        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Estacionamientos
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total de estacionamientos listados según los filtros.
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando estacionamientos...</p>
          ) : parkings.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay estacionamientos para los filtros seleccionados.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Estacionamiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Mensual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrendado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parkings.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {formatCurrency(p.monthly_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.is_rented ? "Sí" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
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
        {openCreateModal && selectedDepartmentId && (
          <CreateParkingModal
            condominiumId={selectedCondoId}
            buildingId={selectedBuildingId}
            departmentId={selectedDepartmentId}
            onClose={() => {
              setOpenCreateModal(false);
              loadParkingsData(selectedDepartmentId);
            }}
          />
        )}

        {openEditModal && selectedParking && (
          <EditParkingModal
            parking={selectedParking}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedParking(null);
              loadParkingsData(selectedDepartmentId || undefined);
            }}
          />
        )}

        {openDeleteModal && selectedParking && (
          <DeleteParkingModal
            parking={selectedParking}
            onClose={() => {
              setOpenDeleteModal(false);
              setSelectedParking(null);
              loadParkingsData(selectedDepartmentId || undefined);
            }}
          />
        )}
      </main>
    </div>
  );
}
