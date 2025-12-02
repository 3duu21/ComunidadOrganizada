import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";

import CreatePaymentModal from "../components/modals/CreatePaymentModal";
import { EditPaymentModal } from "../components/modals/EditPaymentModal";
import DeletePaymentModal from "../components/modals/DeletePaymentModal";

import api from "../services/api";

interface Condominium {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
}

export default function Ingresos() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState<string>("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CL")}`;

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

  // Cargar edificios, opcionalmente por condominio
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

  // Cargar ingresos, filtrando por condominio y edificio
  const loadPayments = async (buildingId?: string, condoId?: string) => {
    try {
      setLoading(true);
      const params: any = {};
      if (buildingId) params.building_id = buildingId;
      if (condoId) params.condominium_id = condoId;

      const res = await api.get("/payments", { params });
      setPayments(res.data || []);
    } catch (err) {
      console.error("Error cargando ingresos:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
    setLoading(false); // al inicio, sin datos, pero sin spinner eterno
  }, []);

  // Cambio de condominio
  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setPayments([]);

    if (cId) {
      loadBuildings(cId);
    } else {
      setBuildings([]);
    }
  };

  // Cambio de edificio
  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);

    if (bId && selectedCondoId) {
      loadPayments(bId, selectedCondoId);
    } else {
      setPayments([]);
    }
  };

  const handleEdit = (payment: any) => {
    setSelectedPayment(payment);
    setOpenEditModal(true);
  };

  const handleDelete = (payment: any) => {
    setSelectedPayment(payment);
    setOpenDeleteModal(true);
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCount = payments.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Ingresos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Controla los pagos recibidos por departamentos, estacionamientos y
              otros conceptos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2"
              disabled={!selectedBuildingId}
            >
              ➕ Agregar Ingreso
            </button>
          </div>
        </div>

        {/* Filtros en tarjeta */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Filtros
          </h3>
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

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Total Ingresos
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Suma de todos los ingresos filtrados.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Ingresos
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Cantidad de pagos registrados.
            </p>
          </div>
        </div>

        {/* Tabla de ingresos */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando ingresos...</p>
          ) : payments.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay ingresos para los filtros seleccionados.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numero Doc.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.document_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.departments?.number || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-green-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.description || "Sin descripción"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.payment_method}
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
        {openCreateModal && (
          <CreatePaymentModal
            buildingId={selectedBuildingId || ""}
            onClose={() => setOpenCreateModal(false)}
            onRefresh={() =>
              loadPayments(
                selectedBuildingId || undefined,
                selectedCondoId || undefined
              )
            }
          />
        )}

        {openEditModal && (
          <EditPaymentModal
            payment={selectedPayment}
            onClose={() => setOpenEditModal(false)}
            onRefresh={() =>
              loadPayments(
                selectedBuildingId || undefined,
                selectedCondoId || undefined
              )
            }
          />
        )}

        {openDeleteModal && (
          <DeletePaymentModal
            payment={selectedPayment}
            onClose={() => setOpenDeleteModal(false)}
            onRefresh={() =>
              loadPayments(
                selectedBuildingId || undefined,
                selectedCondoId || undefined
              )
            }
          />
        )}
      </main>
    </div>
  );
}
