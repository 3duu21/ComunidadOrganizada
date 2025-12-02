import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";

import CreatePaymentModal from "../components/modals/CreatePaymentModal";
import { EditPaymentModal } from "../components/modals/EditPaymentModal";
import DeletePaymentModal from "../components/modals/DeletePaymentModal";

import api from "../services/api";
import { getPaymentTypes } from "../services/payments";
import { getDepartments } from "../services/departments";
import { Department } from "../components/types/Department";

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

  // Tipos de ingreso
  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [selectedTypeIncome, setSelectedTypeIncome] = useState<string>("");

  // Departamentos para filtro
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CL")}`;

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
    buildingName:
      buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
    departmentName:
      departments.find((d) => d.id === selectedDepartmentId)?.number || "—",
  };

  // ===== CARGA DE DATOS =====

  // Cargar condominios
  const loadCondominiums = async () => {
    try {
      const res = await api.get("/condominiums");
      setCondominiums(res.data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
    }
  };

  // Cargar edificios por condominio
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

  // Cargar departamentos del edificio
  const loadDepartments = async (buildingId?: string) => {
    try {
      if (!buildingId) {
        setDepartments([]);
        return;
      }
      const res = await getDepartments(buildingId);
      setDepartments(res);
    } catch (err) {
      console.error("Error cargando departamentos:", err);
      setDepartments([]);
    }
  };

  // Cargar tipos de ingreso
  const loadPaymentTypes = async () => {
    try {
      const types = await getPaymentTypes();
      setPaymentTypes(types || []);
    } catch (err) {
      console.error("Error cargando tipos de ingreso:", err);
    }
  };

  // Cargar ingresos (aplica filtros)
  const loadPayments = async (
    buildingId?: string,
    condoId?: string,
    typeIncome?: string,
    departmentId?: string
  ) => {
    try {
      setLoading(true);
      const params: any = {};
      if (buildingId) params.building_id = buildingId;
      if (condoId) params.condominium_id = condoId;
      if (typeIncome) params.type_income = typeIncome;
      if (departmentId) params.department_id = departmentId;

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
    loadPaymentTypes();
    setLoading(false);
  }, []);

  // ===== HANDLERS FILTROS =====

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setSelectedDepartmentId("");
    setDepartments([]);
    setPayments([]);

    if (cId) {
      loadBuildings(cId);
    } else {
      setBuildings([]);
    }
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);
    setSelectedDepartmentId("");
    setDepartments([]);

    if (bId && selectedCondoId) {
      loadDepartments(bId);
      loadPayments(bId, selectedCondoId, selectedTypeIncome || undefined);
    } else {
      setPayments([]);
    }
  };

  const handleTypeIncomeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setSelectedTypeIncome(value);

    if (selectedBuildingId && selectedCondoId) {
      loadPayments(
        selectedBuildingId,
        selectedCondoId,
        value || undefined,
        selectedDepartmentId || undefined
      );
    }
  };

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setSelectedDepartmentId(value);

    if (selectedBuildingId && selectedCondoId) {
      loadPayments(
        selectedBuildingId,
        selectedCondoId,
        selectedTypeIncome || undefined,
        value || undefined
      );
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

  // ===== PDF DE INGRESOS =====

  const generatePDF = () => {
    if (!payments.length) return;

    const doc = new jsPDF("p", "mm", "a4");

    const formatCurrencyPDF = (value: number) =>
      `$${(value || 0).toLocaleString("es-CL")}`;

    const todayLabel = new Date().toLocaleDateString("es-CL");

    // Header principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("RESUMEN DE INGRESOS", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Caja info condominio / edificio
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(12, 24, 120, 18);

    doc.text("Condominio Organizado", 14, 29);
    doc.text(`Condominio: ${filters.condominiumName}`, 14, 34);
    if (filters.buildingName !== "—") {
      doc.text(`Edificio: ${filters.buildingName}`, 14, 39);
    }

    // Info adicional a la derecha
    doc.text(`Fecha emisión: ${todayLabel}`, 198, 29, { align: "right" });
    if (selectedDepartmentId) {
      doc.text(
        `Depto: ${filters.departmentName}`,
        198,
        34,
        { align: "right" }
      );
    }
    if (selectedTypeIncome) {
      doc.text(
        `Tipo ingreso: ${selectedTypeIncome}`,
        198,
        39,
        { align: "right" }
      );
    }

    // Línea separadora
    doc.line(12, 46, 198, 46);

    // Tabla de ingresos
    const body = payments.map((p) => [
      p.document_number || "",
      p.date || "",
      p.departments?.number || "—",
      p.description || "Sin descripción",
      p.type_income || "—",
      p.payment_method || "—",
      formatCurrencyPDF(p.amount || 0),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "N° Doc",
          "Fecha",
          "Depto",
          "Descripción",
          "Tipo ingreso",
          "Tipo pago",
          "Monto",
        ],
      ],
      body,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [250, 250, 250],
        textColor: 40,
        lineWidth: 0.1,
      },
      bodyStyles: {
        lineWidth: 0.08,
      },
      columnStyles: {
        2: { cellWidth: 18 },
        3: { cellWidth: 50 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { halign: "right" },
      },
      margin: { left: 12, right: 12 },
      theme: "grid",
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(12, finalY + 4, 186, 8, "F");
    doc.text("TOTAL INGRESOS", 14, finalY + 9);
    doc.text(formatCurrencyPDF(totalAmount), 198, finalY + 9, {
      align: "right",
    });

    const safeCondo =
      filters.condominiumName === "—"
        ? "sin_condominio"
        : filters.condominiumName.replace(/\s+/g, "_");
    const safeBuilding =
      filters.buildingName === "—"
        ? ""
        : "_" + filters.buildingName.replace(/\s+/g, "_");

    doc.save(`ingresos_${safeCondo}${safeBuilding}.pdf`);
  };

  // ===== UI =====

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
              onClick={generatePDF}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 text-sm flex items-center gap-2 disabled:opacity-50"
              disabled={payments.length === 0}
            >
              🧾 Descargar PDF
            </button>

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
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="">Todos</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de ingreso */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tipo de ingreso
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedTypeIncome}
                onChange={handleTypeIncomeChange}
                disabled={!selectedBuildingId}
              >
                <option value="">Todos</option>
                {paymentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
            {selectedDepartmentId && (
              <span className="px-2 py-1 rounded-full bg-gray-100 border">
                Depto:{" "}
                <span className="font-semibold text-gray-700">
                  {filters.departmentName}
                </span>
              </span>
            )}
            {selectedTypeIncome && (
              <span className="px-2 py-1 rounded-full bg-gray-100 border">
                Tipo ingreso:{" "}
                <span className="font-semibold text-gray-700">
                  {selectedTypeIncome}
                </span>
              </span>
            )}
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
                    Tipo ingreso
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
                      {p.type_income || "—"}
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
                selectedCondoId || undefined,
                selectedTypeIncome || undefined,
                selectedDepartmentId || undefined
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
                selectedCondoId || undefined,
                selectedTypeIncome || undefined,
                selectedDepartmentId || undefined
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
                selectedCondoId || undefined,
                selectedTypeIncome || undefined,
                selectedDepartmentId || undefined
              )
            }
          />
        )}
      </main>
    </div>
  );
}
