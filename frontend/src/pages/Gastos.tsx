import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import CreateExpenseModal from "../components/modals/CreateExpenseModal";
import { EditExpenseModal } from "../components/modals/EditExpenseModal";
import { DeleteExpenseModal } from "../components/modals/DeleteExpenseModal";
import { getExpenses } from "../services/expenses"; // si no lo usas puedes borrarlo
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Condominium {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
}

export default function Gastos() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState<string>("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
    buildingName:
      buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
    type_expense: selectedType || "Todos",
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CL")}`;

  const generatePDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Gastos", 14, 20);

    // Subtítulo con filtros activos
    doc.setFontSize(12);
    doc.text(
      `Filtros aplicados:
Condominio: ${filters.condominiumName || "—"}
Edificio: ${filters.buildingName || "—"}
Tipo: ${filters.type_expense || "Todos"}`,
      14,
      30
    );

    // Construimos la tabla
    const tableData = expenses.map((e) => [
      e.date,
      e.description,
      e.type_expense,
      formatCurrency(e.amount),
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Fecha", "Descripción", "Tipo de gasto", "Monto"]],
      body: tableData,
    });

    // Guardar
    doc.save("reporte_gastos.pdf");
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

  // Cargar gastos, filtrando opcionalmente por condominio y edificio
  const loadExpenses = async (
    buildingId?: string,
    condoId?: string,
    type?: string
  ) => {
    try {
      setLoading(true);
      const params: any = {};
      if (buildingId) params.building_id = buildingId;
      if (condoId) params.condominium_id = condoId;
      if (type) params.type_expense = type;

      const res = await api.get("/expenses", { params });
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error cargando gastos:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
  }, []);

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setSelectedType("");
    setExpenses([]);

    if (cId) {
      loadBuildings(cId);
    } else {
      setBuildings([]);
    }
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);
    setSelectedType("");

    if (selectedCondoId && bId) {
      loadExpenses(bId, selectedCondoId);
    } else {
      setExpenses([]);
    }
  };

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setOpenEditModal(true);
  };

  const handleDelete = (expense: any) => {
    setSelectedExpense(expense);
    setOpenDeleteModal(true);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (selectedCondoId && selectedBuildingId) {
      loadExpenses(selectedBuildingId, selectedCondoId, value);
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Gastos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Revisa, filtra y gestiona los gastos del condominio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 text-sm flex items-center gap-2"
              disabled={!expenses.length}
            >
              🧾 Descargar PDF
            </button>
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2"
              disabled={!selectedBuildingId}
            >
              ➕ Agregar Gasto
            </button>
          </div>
        </div>

        {/* Filtros en tarjeta */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Filtros
          </h3>
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

            {/* Tipo de gasto */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tipo de gasto
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={!selectedBuildingId}
              >
                <option value="">Todos</option>
                <option value="Remuneraciones y Gastos de Administracion">
                  Remuneraciones y Gastos de Administracion
                </option>
                <option value="Gastos Generales y Gastos de uso y consumo">
                  Gastos Generales y Gastos de uso y consumo
                </option>
                <option value="Gastos de Mantencion y Reparacion">
                  Gastos de Mantencion y Reparacion
                </option>
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
              Tipo:{" "}
              <span className="font-semibold text-gray-700">
                {filters.type_expense}
              </span>
            </span>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Total Gastos
            </h3>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Suma de todos los gastos filtrados.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Gastos
            </h3>
            <p className="text-2xl font-bold text-blue-500">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Cantidad de registros en la tabla.
            </p>
          </div>
        </div>

        {/* Tabla de gastos */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando gastos...</p>
          ) : expenses.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay gastos para los filtros seleccionados.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {exp.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {exp.type_expense}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-red-500">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(exp)}
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
          <CreateExpenseModal
            buildingId={selectedBuildingId || undefined}
            onClose={() => {
              setOpenCreateModal(false);
              loadExpenses(
                selectedBuildingId || undefined,
                selectedCondoId || undefined,
                selectedType || undefined
              );
            }}
          />
        )}

        {openEditModal && (
          <EditExpenseModal
            expense={selectedExpense}
            onClose={() => {
              setOpenEditModal(false);
              loadExpenses(
                selectedBuildingId || undefined,
                selectedCondoId || undefined,
                selectedType || undefined
              );
            }}
          />
        )}

        {openDeleteModal && (
          <DeleteExpenseModal
            expense={selectedExpense}
            onClose={() => {
              setOpenDeleteModal(false);
              loadExpenses(
                selectedBuildingId || undefined,
                selectedCondoId || undefined,
                selectedType || undefined
              );
            }}
          />
        )}
      </main>
    </div>
  );
}
