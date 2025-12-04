// src/pages/owner/MisGastosComunes.tsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OwnerDepartment {
  id: string;
  number: string;
  building_id: string;
}

interface ReceiptPayment {
  id: string;
  date: string;
  amount: number;
  payment_method: string | null;
  description: string | null;
}

interface ReceiptResponse {
  period: {
    id: string;
    year: number;
    month: number;
    status: "open" | "closed";
    common_fee_amount: number;
  };
  department: {
    id: string;
    number: string;
  };
  building: {
    id: string;
    name: string;
  };
  condominium: {
    id: string;
    name: string;
  };
  charge_amount: number;
  payments: ReceiptPayment[];
  totals: {
    charged: number;
    paid: number;
    balance: number;
    status: "pagado" | "parcial" | "pendiente";
  };
}

const months = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

export default function MisGastosComunes() {
  const [departments, setDepartments] = useState<OwnerDepartment[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  const [loadingDeps, setLoadingDeps] = useState(true);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [error, setError] = useState<string>("");

  const formatCurrency = (value: number) =>
    `$${(value || 0).toLocaleString("es-CL")}`;

  const loadDepartments = async () => {
    try {
      setLoadingDeps(true);
      const res = await api.get("/owner/departments");
      const deps: OwnerDepartment[] = res.data || [];
      setDepartments(deps);
      if (deps.length > 0) {
        setSelectedDeptId(deps[0].id);
      }
    } catch (e) {
      console.error("Error cargando departamentos del propietario", e);
      setDepartments([]);
    } finally {
      setLoadingDeps(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleGeneratePDF = async () => {
    setError("");

    if (!selectedDeptId) {
      setError("Debes seleccionar un departamento.");
      return;
    }

    try {
      setLoadingReceipt(true);

      const res = await api.get<ReceiptResponse>(
        "/owner/gastos-comunes/receipt",
        {
          params: {
            department_id: selectedDeptId,
            year,
            month,
          },
        }
      );

      const receipt = res.data;
      generatePDF(receipt);
    } catch (e: any) {
      console.error("Error obteniendo boleta de GC", e);
      const msg =
        e?.response?.data?.message ||
        "No se encontró información de gastos comunes para ese mes.";
      setError(msg);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const generatePDF = (receipt: ReceiptResponse) => {
    const doc = new jsPDF("p", "mm", "a4");

    const formatCurrencyPDF = (value: number) =>
      `$${(value || 0).toLocaleString("es-CL")}`;

    const periodLabel = `${months.find((m) => m.value === receipt.period.month)?.label || ""
      } ${receipt.period.year}`;

    const todayLabel = new Date().toLocaleDateString("es-CL");

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("BOLETA DE GASTO COMÚN", 105, 18, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Caja info condominio / depto
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(12, 24, 120, 24);

    doc.text(
      receipt.condominium?.name || "Condominio Organizado",
      14,
      29
    );
    doc.text(`Edificio: ${receipt.building?.name || "—"}`, 14, 34);
    doc.text(`Departamento: ${receipt.department.number}`, 14, 39);
    doc.text(`Periodo: ${periodLabel}`, 14, 44);

    // Info adicional derecha
    doc.text(`Fecha emisión: ${todayLabel}`, 198, 29, { align: "right" });
    doc.text(
      `Estado: ${receipt.totals.status.toUpperCase()}`,
      198,
      34,
      { align: "right" }
    );
    doc.text(
      `Estado periodo: ${receipt.period.status.toUpperCase()}`,
      198,
      39,
      { align: "right" }
    );

    // Línea separadora
    doc.line(12, 52, 198, 52);

    // Resumen de montos
    doc.setFont("helvetica", "bold");
    doc.text("Resumen del periodo", 12, 58);

    doc.setFont("helvetica", "normal");
    doc.text(
      `Monto Gasto Común: ${formatCurrencyPDF(receipt.charge_amount)}`,
      12,
      64
    );
    doc.text(
      `Total pagado: ${formatCurrencyPDF(receipt.totals.paid)}`,
      12,
      69
    );
    doc.text(
      `Saldo pendiente: ${formatCurrencyPDF(
        receipt.totals.balance > 0 ? receipt.totals.balance : 0
      )}`,
      12,
      74
    );

    // Tabla de pagos
    const startY = 82;

    doc.setFont("helvetica", "bold");
    doc.text("Detalle de pagos", 12, startY - 4);

    const body =
      receipt.payments.length > 0
        ? receipt.payments.map((p) => [
          p.date || "",
          p.payment_method || "—",
          p.description || "Sin descripción",
          formatCurrencyPDF(p.amount || 0),
        ])
        : [
          [
            "—",
            "—",
            "No se registran pagos para este periodo.",
            formatCurrencyPDF(0),
          ],
        ];

    autoTable(doc, {
      startY,
      head: [["Fecha", "Método", "Descripción", "Monto"]],
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
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 90 },
        3: { halign: "right" },
      },
      margin: { left: 12, right: 12 },
      theme: "grid",
    });

    // Nota final
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(8);
    doc.text(
      "Este comprobante corresponde al registro de gastos comunes según la información ingresada en el sistema.",
      12,
      finalY + 8
    );

    const safeCondo = (receipt.condominium?.name || "condominio")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const safeDept = receipt.department.number.replace(/\s+/g, "_");
    const safePeriod = `${receipt.period.year}_${String(
      receipt.period.month
    ).padStart(2, "0")}`;

    doc.save(`boleta_gc_${safeCondo}_${safeDept}_${safePeriod}.pdf`);
  };

  const years = [
    year - 1,
    year,
    year + 1, // puedes ajustar el rango que quieras
  ];

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Mis gastos comunes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Descarga tu boleta/comprobante de gasto común por cada mes.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Selecciona periodo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Departamento */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Departamento
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                disabled={loadingDeps || departments.length === 0}
              >
                {loadingDeps ? (
                  <option>Cargando...</option>
                ) : departments.length === 0 ? (
                  <option>No tienes departamentos asociados</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      Depto {d.number}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Año
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Mes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Mes
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="mt-4">
            <button
              onClick={handleGeneratePDF}
              disabled={
                loadingReceipt ||
                loadingDeps ||
                !selectedDeptId ||
                departments.length === 0
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loadingReceipt ? "Generando boleta..." : "🧾 Descargar Boleta PDF"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
