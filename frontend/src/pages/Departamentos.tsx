import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import CreateDepartmentModal from "../components/modals/CreateDepartmentModal";
import { EditDepartmentModal } from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";
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

type HistoryStatus = "pagado" | "parcial" | "no_pagado";

interface DepartmentHistoryRow {
  period_id: string;
  year: number;
  month: number;
  charge_amount: number;
  paid_amount: number;
  status: HistoryStatus;
}

const monthNames = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatCurrency = (value: number) =>
  `$${(value || 0).toLocaleString("es-CL")}`;

// ===== Modal para crear acceso de propietario =====
interface CreateOwnerAccessModalProps {
  department: any;
  onClose: () => void;
}

function CreateOwnerAccessModal({
  department,
  onClose,
}: CreateOwnerAccessModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    generatedPassword: string | null;
    userCreated: boolean;
  } | null>(null);

  const ownerEmail = department?.owner_email || "";
  const ownerName = department?.owner_name || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setApiError(null);
    setSuccessInfo(null);

    if (!ownerEmail) {
      setApiError(
        "Este departamento no tiene un correo de propietario. Agrega un correo antes de crear el acceso."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        `/departments/${department.id}/create-owner-access`,
        {
          password: password.trim() || undefined,
        }
      );

      const data = res.data || {};
      setSuccessInfo({
        email: data.email,
        generatedPassword: data.generatedPassword || null,
        userCreated: !!data.userCreated,
      });
    } catch (err: any) {
      console.error("Error creando acceso de propietario:", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (backendMessage) {
        setApiError(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo crear el acceso de propietario. Revisa tu plan o intenta nuevamente."
        );
      } else {
        setApiError(
          "No se pudo crear el acceso de propietario. Revisa tu plan o intenta nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-3">
          Crear acceso de propietario
        </h3>

        {/* Error API */}
        {apiError && (
          <div className="mb-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">
            <p className="font-semibold">
              No se pudo crear el acceso de propietario
            </p>
            <p className="mt-1">{apiError}</p>
            <p className="mt-1 text-xs text-red-700">
              Si tu plan no incluye portal de propietarios o alcanzaste el
              límite, puedes mejorarlo desde el panel principal.
            </p>
          </div>
        )}

        {/* Mensaje éxito */}
        {successInfo && (
          <div className="mb-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2">
            <p className="font-semibold">Acceso creado correctamente</p>
            <p className="mt-1">
              Correo del propietario:{" "}
              <span className="font-mono">{successInfo.email}</span>
            </p>
            {successInfo.userCreated && successInfo.generatedPassword && (
              <p className="mt-1">
                Usuario nuevo creado con contraseña temporal:{" "}
                <span className="font-mono font-semibold">
                  {successInfo.generatedPassword}
                </span>
                .
              </p>
            )}
            {!successInfo.userCreated && (
              <p className="mt-1">
                El propietario ya tenía una cuenta. Solo se vinculó al
                condominio y al departamento.
              </p>
            )}
            <p className="mt-1 text-xs text-green-700">
              Comparte estas credenciales con el propietario para que pueda
              acceder al portal.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p>
              <span className="font-semibold">Departamento:</span>{" "}
              {department?.number}
            </p>
            <p>
              <span className="font-semibold">Propietario:</span>{" "}
              {ownerName || "—"}
            </p>
            <p>
              <span className="font-semibold">Correo:</span>{" "}
              {ownerEmail || "—"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña para el propietario
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm border-gray-300"
              placeholder="Deja en blanco para generar una contraseña temporal"
              disabled={loading}
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo recomendado: 6 caracteres. Si lo dejas vacío, el sistema
              generará una contraseña temporal.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              disabled={loading}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-sm"
              disabled={loading}
            >
              {loading ? "Creando acceso..." : "Crear acceso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Componente principal =====
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

  // ===== Historial por depto =====
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<DepartmentHistoryRow[]>([]);
  const [historyDepartment, setHistoryDepartment] = useState<any>(null);

  // ===== Acceso propietario =====
  const [openOwnerAccessModal, setOpenOwnerAccessModal] = useState(false);
  const [ownerAccessDepartment, setOwnerAccessDepartment] = useState<any>(null);
  const [allowOwnerPortal, setAllowOwnerPortal] = useState<boolean | null>(
    null
  );

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

  // Cargar info de plan (para saber si se permite portal propietarios)
  const loadPlanInfo = async () => {
    try {
      const res = await api.get("/me");
      const data = res.data;
      if (data?.plan?.allow_owner_portal === true) {
        setAllowOwnerPortal(true);
      } else {
        setAllowOwnerPortal(false);
      }
    } catch (err) {
      console.error("Error obteniendo plan desde /me:", err);
      setAllowOwnerPortal(null);
    }
  };

  useEffect(() => {
    loadCondominiums();
    loadBuildings();
    loadDepartments();
    loadPlanInfo();
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

  // ===== Abrir historial por departamento =====
  const handleOpenHistory = async (dept: any) => {
    if (!selectedBuildingId) {
      alert("Debes seleccionar un edificio primero.");
      return;
    }

    setHistoryDepartment(dept);
    setOpenHistoryModal(true);
    setHistory([]);
    setHistoryLoading(true);

    try {
      const res = await api.get("/billing-periods/history/by-department", {
        params: {
          building_id: selectedBuildingId,
          department_id: dept.id,
        },
      });

      setHistory(res.data || []);
    } catch (e) {
      console.error("Error cargando histórico de depto", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ===== Abrir modal acceso propietario =====
  const handleOpenOwnerAccess = (dept: any) => {
    if (!dept.owner_email) {
      alert(
        "Este departamento no tiene un correo de propietario registrado. Edítalo y agrega un correo antes de crear el acceso."
      );
      return;
    }
    setOwnerAccessDepartment(dept);
    setOpenOwnerAccessModal(true);
  };

  // ===== PDF del historial =====
  const generateHistoryPDF = () => {
    if (!historyDepartment || history.length === 0) return;

    const doc = new jsPDF("p", "mm", "a4");

    const formatCurrencyPDF = (value: number) =>
      `$${(value || 0).toLocaleString("es-CL")}`;

    const todayLabel = new Date().toLocaleDateString("es-CL");

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("HISTORIAL DE GASTO COMÚN POR DEPARTAMENTO", 105, 18, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Caja info izq
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(12, 24, 120, 20);

    doc.text("Condominio Organizado", 14, 29);
    doc.text(`Condominio: ${filters.condominiumName}`, 14, 34);
    if (filters.buildingName !== "—") {
      doc.text(`Edificio: ${filters.buildingName}`, 14, 39);
    }
    doc.text(`Depto: ${historyDepartment.number || "—"}`, 14, 44);

    // Info derecha
    doc.text(`Fecha emisión: ${todayLabel}`, 198, 29, {
      align: "right",
    });

    // Línea separadora
    doc.line(12, 48, 198, 48);

    // Cálculo totales
    const totalCharged = history.reduce(
      (s, h) => s + (h.charge_amount || 0),
      0
    );
    const totalPaid = history.reduce((s, h) => s + (h.paid_amount || 0), 0);

    // Tabla
    const body = history.map((h) => {
      const saldo = (h.charge_amount || 0) - (h.paid_amount || 0);

      const statusLabel =
        h.status === "pagado"
          ? "Pagado"
          : h.status === "parcial"
            ? "Parcial"
            : "No pagado";

      return [
        `${monthNames[h.month]} ${h.year}`,
        formatCurrencyPDF(h.charge_amount),
        formatCurrencyPDF(h.paid_amount),
        formatCurrencyPDF(saldo),
        statusLabel,
      ];
    });

    autoTable(doc, {
      startY: 52,
      head: [["Periodo", "Cobrado", "Pagado", "Saldo", "Estado"]],
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
        0: { cellWidth: 40 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { cellWidth: 25 },
      },
      margin: { left: 12, right: 12 },
      theme: "grid",
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    // Totales
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(12, finalY + 4, 186, 10, "F");

    doc.text("TOTAL COBRADO:", 14, finalY + 10);
    doc.text(formatCurrencyPDF(totalCharged), 90, finalY + 10, {
      align: "right",
    });

    doc.text("TOTAL PAGADO:", 110, finalY + 10);
    doc.text(formatCurrencyPDF(totalPaid), 198, finalY + 10, {
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
    const safeDept =
      historyDepartment.number?.toString().replace(/\s+/g, "_") || "depto";

    doc.save(
      `historial_gc_${safeCondo}${safeBuilding}_depto_${safeDept}.pdf`
    );
  };

  const totalCount = departments.length;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Departamentos</h2>
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
                      {/* Estado de acceso */}
                      {Array.isArray(dep.department_users) && dep.department_users.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mr-3">
                          ✅ Acceso activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold mr-3">
                          ⛔ Sin acceso
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(dep)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(dep)}
                        className="text-red-600 hover:text-red-800 mr-3"
                      >
                        🗑 Eliminar
                      </button>
                      <button
                        onClick={() => handleOpenHistory(dep)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3"
                      >
                        📊 Historial GC
                      </button>
                      {allowOwnerPortal && (
                        <button
                          onClick={() => handleOpenOwnerAccess(dep)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          🔑 Acceso propietario
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Historial de Gasto Común */}
        {openHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Historial de Gasto Común
                  </h3>
                  {historyDepartment && (
                    <p className="text-xs text-gray-500">
                      Depto:{" "}
                      <span className="font-semibold">
                        {historyDepartment.number}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateHistoryPDF}
                    disabled={historyLoading || history.length === 0}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50"
                  >
                    🧾 Descargar PDF
                  </button>
                  <button
                    onClick={() => setOpenHistoryModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-4">
                {historyLoading ? (
                  <p className="text-sm text-gray-500">
                    Cargando historial...
                  </p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay periodos registrados para este departamento.
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periodo
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cobrado
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pagado
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saldo
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((h) => {
                        const saldo =
                          (h.charge_amount || 0) - (h.paid_amount || 0);

                        const statusLabel =
                          h.status === "pagado"
                            ? "Pagado"
                            : h.status === "parcial"
                              ? "Parcial"
                              : "No pagado";

                        const statusColor =
                          h.status === "pagado"
                            ? "bg-green-100 text-green-700"
                            : h.status === "parcial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700";

                        return (
                          <tr key={h.period_id}>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                              {monthNames[h.month]} {h.year}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-gray-700">
                              {formatCurrency(h.charge_amount)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-gray-700">
                              {formatCurrency(h.paid_amount)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-gray-700">
                              {formatCurrency(saldo)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modales CRUD */}
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

        {/* Modal Acceso propietario */}
        {openOwnerAccessModal && ownerAccessDepartment && (
          <CreateOwnerAccessModal
            department={ownerAccessDepartment}
            onClose={() => {
              setOpenOwnerAccessModal(false);
              setOwnerAccessDepartment(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
