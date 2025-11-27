// src/pages/Balance.tsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
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

interface Expense {
  id: string;
  date: string;
  description: string;
  type_expense: string;
  amount: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  description?: string | null;
  departments?: {
    number?: string;
  };
}

export default function Balance() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [selectedCondoId, setSelectedCondoId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(now.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(now.getFullYear())
  );

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CL")}`;

  const monthOptions = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const filters = {
    condominiumName:
      condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
    buildingName:
      buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
    periodLabel:
      (monthOptions.find((m) => m.value === selectedMonth)?.label || "Todo") +
      " " +
      (selectedYear || ""),
  };

  // ======== CARGA ========

  const loadCondominiums = async () => {
    try {
      const res = await api.get("/condominiums");
      setCondominiums(res.data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
    }
  };

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

  const loadExpensesAndPayments = async (
    buildingId?: string,
    condoId?: string
  ) => {
    try {
      setLoading(true);

      const paramsBase: any = {};
      if (buildingId) paramsBase.building_id = buildingId;
      if (condoId) paramsBase.condominium_id = condoId;

      const expensesRes = await api.get("/expenses", { params: paramsBase });
      const paymentsRes = await api.get("/payments", { params: paramsBase });

      setExpenses(expensesRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (err) {
      console.error("Error cargando gastos/ingresos para balance:", err);
      setExpenses([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominiums();
    loadBuildings();
  }, []);

  // ======== HANDLERS FILTROS ========

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCondoId(cId);
    setSelectedBuildingId("");
    setBuildings([]);
    setExpenses([]);
    setPayments([]);

    if (cId) {
      loadBuildings(cId);
      loadExpensesAndPayments(undefined, cId);
    }
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBuildingId(bId);
    setExpenses([]);
    setPayments([]);

    if (bId) {
      loadExpensesAndPayments(bId, selectedCondoId || undefined);
    } else if (selectedCondoId) {
      loadExpensesAndPayments(undefined, selectedCondoId);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // ======== FILTRO CLIENTE ========

  const periodStart = useMemo(
    () => new Date(Number(selectedYear), Number(selectedMonth) - 1, 1),
    [selectedMonth, selectedYear]
  );

  const filterByPeriod = <T extends { date: string }>(items: T[]): T[] => {
    if (!selectedMonth && !selectedYear) return items;

    return items.filter((item) => {
      if (!item.date) return false;
      const d = new Date(item.date);

      const matchesMonth = selectedMonth
        ? d.getMonth() + 1 === Number(selectedMonth)
        : true;
      const matchesYear = selectedYear
        ? d.getFullYear() === Number(selectedYear)
        : true;

      return matchesMonth && matchesYear;
    });
  };

  const filteredExpenses = useMemo(
    () => filterByPeriod(expenses),
    [expenses, selectedMonth, selectedYear]
  );
  const filteredPayments = useMemo(
    () => filterByPeriod(payments),
    [payments, selectedMonth, selectedYear]
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );
  const totalIncomes = filteredPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  const balance = totalIncomes - totalExpenses;

  const previousExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d < periodStart;
  });
  const previousPayments = payments.filter((p) => {
    const d = new Date(p.date);
    return d < periodStart;
  });
  const saldoAnterior =
    previousPayments.reduce((s, p) => s + (p.amount || 0), 0) -
    previousExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  // ======== PDF ========

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // --- Helpers internos ---
    const formatCurrency = (value: number) =>
      `$${(value || 0).toLocaleString("es-CL")}`;

    const monthLabel =
      monthOptions.find((m) => m.value === selectedMonth)?.label?.toUpperCase() ||
      "";

    // 🧮 Recalcular rápido con lo que ya tienes en el front
    const periodStart = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);

    const filterByPeriod = <T extends { date: string }>(items: T[]): T[] => {
      return items.filter((item) => {
        if (!item.date) return false;
        const d = new Date(item.date);
        const matchesMonth = d.getMonth() + 1 === Number(selectedMonth);
        const matchesYear = d.getFullYear() === Number(selectedYear);
        return matchesMonth && matchesYear;
      });
    };

    const periodExpenses = filterByPeriod(expenses);
    const periodPayments = filterByPeriod(payments);

    const totalExpenses = periodExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalIncomes = periodPayments.reduce((s, p) => s + (p.amount || 0), 0);

    const previousExpenses = expenses.filter((e) => new Date(e.date) < periodStart);
    const previousPayments = payments.filter((p) => new Date(p.date) < periodStart);

    const saldoAnterior =
      previousPayments.reduce((s, p) => s + (p.amount || 0), 0) -
      previousExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    const gastos1 = periodExpenses.filter((e) =>
      [
        "Remuneraciones y Gastos de Administracion",
        "Remuneraciones y Gastos de Administración",
      ].includes(e.type_expense)
    );
    const gastos2 = periodExpenses.filter(
      (e) => e.type_expense === "Gastos Generales y Gastos de uso y consumo"
    );
    const gastos3 = periodExpenses.filter((e) =>
      [
        "Gastos de Mantencion y Reparacion",
        "Gastos de Mantención y Reparación",
      ].includes(e.type_expense)
    );

    const subtotal1 = gastos1.reduce((s, e) => s + (e.amount || 0), 0);
    const subtotal2 = gastos2.reduce((s, e) => s + (e.amount || 0), 0);
    const subtotal3 = gastos3.reduce((s, e) => s + (e.amount || 0), 0);

    const totalIngresosConSaldo = saldoAnterior + totalIncomes;
    const saldoFinal = totalIngresosConSaldo - totalExpenses;

    // ============== HEADER ==============
    // Caja “mes/año” arriba derecha (la dejamos donde estaba)
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(170, 10, 28, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${monthLabel} ${selectedYear}`, 171, 15, { align: "left" });

    // Título central (un poco más abajo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("RESUMEN GASTOS E INGRESOS DE DINERO", 105, 20, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Periodo: ${filters.periodLabel}`, 105, 25, { align: "center" });

    // Caja superior izquierda (la bajamos para que no choque)
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(12, 30, 80, 18); // antes estaba en y=10
    doc.text("Condominio Organizado", 14, 35);
    doc.text(`Condominio: ${filters.condominiumName}`, 14, 40);
    if (filters.buildingName !== "—") {
      doc.text(`Edificio: ${filters.buildingName}`, 14, 45);
    }

    // Línea horizontal un poco más abajo
    doc.line(12, 52, 198, 52);

    // SALDO ANTERIOR también lo bajamos
    doc.setFont("helvetica", "bold");
    doc.text("SALDO EN CAJA MES ANTERIOR:", 14, 58);
    doc.text(formatCurrency(saldoAnterior), 198, 58, { align: "right" });

    // Y a partir de aquí usas este currentY inicial:
    let currentY = 64;


    // ===== helper para secciones de gastos =====
    const addExpenseSection = (
      titulo: string,
      numeracion: string,
      rows: Expense[]
    ) => {
      if (!rows.length) return currentY;

      // fondo gris título sección
      doc.setFillColor(245, 245, 245);
      doc.rect(12, currentY - 4, 186, 6, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${numeracion}) ${titulo}`, 14, currentY);

      const body = rows.map((e) => [
        e.date || "",
        e.description || "",
        formatCurrency(e.amount || 0),
      ]);

      autoTable(doc, {
        startY: currentY + 2,
        head: [["Fecha", "Descripción", "Monto"]],
        body,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [250, 250, 250],
          textColor: 40,
          lineWidth: 0.1,
        },
        bodyStyles: { lineWidth: 0.08 },
        columnStyles: {
          2: { halign: "right" },
        },
        margin: { left: 12, right: 12 },
        theme: "grid",
      });

      const subtotal = rows.reduce((s, e) => s + (e.amount || 0), 0);
      const finalY = (doc as any).lastAutoTable.finalY + 3;

      doc.setFont("helvetica", "bold");
      doc.text(`Subtotal ${titulo}`, 14, finalY);
      doc.text(formatCurrency(subtotal), 198, finalY, { align: "right" });

      currentY = finalY + 8;
      return currentY;
    };

    // ============== GASTOS (3 BLOQUES) ==============
    currentY = addExpenseSection(
      "Remuneraciones y Gastos de Administración",
      "1",
      gastos1
    );
    currentY = addExpenseSection(
      "Gastos Generales y Gastos de uso y consumo",
      "2",
      gastos2
    );
    currentY = addExpenseSection(
      "Gastos de Mantención y Reparación",
      "3",
      gastos3
    );

    // TOTAL GASTOS MES
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(12, currentY - 4, 186, 7, "F");
    doc.text("TOTAL GASTOS DEL MES", 14, currentY);
    doc.text(formatCurrency(totalExpenses), 198, currentY, { align: "right" });

    // ============== RESUMEN INGRESOS ==============
    currentY += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN INGRESOS", 14, currentY);
    doc.line(14, currentY + 1, 70, currentY + 1);

    const ingresosBody = [
      ["Saldo en caja mes anterior", formatCurrency(saldoAnterior)],
      ["Recaudación del mes", formatCurrency(totalIncomes)],
    ];

    autoTable(doc, {
      startY: currentY + 3,
      head: [["Detalle", "Monto"]],
      body: ingresosBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [250, 250, 250], textColor: 40 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: 12, right: 12 },
      theme: "grid",
    });

    let afterIngresosY = (doc as any).lastAutoTable.finalY + 3;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Total Saldo Anterior + Ingresos del Mes",
      14,
      afterIngresosY
    );
    doc.text(formatCurrency(totalIngresosConSaldo), 198, afterIngresosY, {
      align: "right",
    });

    // ============== RESUMEN EGRESOS ==============
    afterIngresosY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN EGRESOS", 14, afterIngresosY);
    doc.line(14, afterIngresosY + 1, 60, afterIngresosY + 1);

    const egresosBody = [
      [
        "(1) Remuneraciones y Gastos de Administración",
        formatCurrency(subtotal1),
      ],
      [
        "(2) Gastos Generales y Gastos de uso y consumo",
        formatCurrency(subtotal2),
      ],
      [
        "(3) Gastos de Mantención y Reparación",
        formatCurrency(subtotal3),
      ],
      ["Total Gastos del Mes", formatCurrency(totalExpenses)],
    ];

    autoTable(doc, {
      startY: afterIngresosY + 3,
      head: [["Detalle", "Monto"]],
      body: egresosBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [250, 250, 250], textColor: 40 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: 12, right: 12 },
      theme: "grid",
    });

    const afterEgresosY = (doc as any).lastAutoTable.finalY + 5;

    // ============== SALDO FINAL ==============
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(12, afterEgresosY - 5, 186, 8, "F");
    doc.text("SALDO EN CAJA DISPONIBLE", 14, afterEgresosY);
    doc.text(formatCurrency(saldoFinal), 198, afterEgresosY, {
      align: "right",
    });

    // Notas al pie (como en el ejemplo)
    const footerY = afterEgresosY + 10;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      "* RETIRE SU COMPROBANTE DE PAGO A LA BREVEDAD POSIBLE EN CONSERJERÍA.",
      12,
      footerY
    );
    doc.text(
      "* SE ACEPTAN RECLAMOS SOLO CON EL COMPROBANTE DE PAGO.",
      12,
      footerY + 4
    );

    doc.save(`balance_${monthLabel}_${selectedYear}.pdf`);
  };

  // ======== UI ========

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-slate-100 p-2">
        {/* HEADER */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-6 py-5 shadow-md text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Balance General
              </h1>
              <p className="mt-1 text-sm text-slate-100/80">
                Resumen de ingresos y gastos del condominio por periodo.
              </p>
              <p className="mt-1 text-xs text-slate-100/70">
                {filters.condominiumName !== "—" && (
                  <>
                    Condominio <span className="font-semibold">{filters.condominiumName}</span>
                    {filters.buildingName !== "—" && (
                      <>
                        {" · "}Edificio{" "}
                        <span className="font-semibold">
                          {filters.buildingName}
                        </span>
                      </>
                    )}
                    {" · "}
                  </>
                )}
                Periodo{" "}
                <span className="font-semibold">{filters.periodLabel}</span>
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <button
                onClick={generatePDF}
                disabled={
                  filteredExpenses.length === 0 &&
                  filteredPayments.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
              >
                🧾 Descargar PDF
              </button>
              <span className="text-[11px] text-slate-100/70">
                Usa los filtros de abajo para ajustar el periodo.
              </span>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <section className="mb-6 rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs">
                ⚙
              </span>
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Condominio
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Edificio
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:bg-slate-100"
                value={selectedBuildingId}
                onChange={handleBuildingChange}
                disabled={!selectedCondoId}
              >
                <option value="">Todos</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Mes
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Año
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                value={selectedYear}
                onChange={handleYearChange}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Ingresos
            </span>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncomes)}
            </p>
            <p className="text-[11px] text-slate-500">
              Pagos registrados en el periodo seleccionado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Gastos
            </span>
            <p className="text-2xl font-bold text-rose-600">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-[11px] text-slate-500">
              Suma de todos los gastos del periodo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Saldo Neto del Periodo
            </span>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-orange-500"
                }`}
            >
              {formatCurrency(balance)}
            </p>
            <p className="text-[11px] text-slate-500">
              Ingresos menos gastos en el mes seleccionado.
            </p>
          </div>
        </section>

        {/* TABLAS DETALLE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* GASTOS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs">
                  −
                </span>
                Detalle de Gastos
              </h3>
              <span className="text-xs text-slate-500">
                {filteredExpenses.length} registro(s)
              </span>
            </div>
            {loading ? (
              <p className="p-4 text-gray-600 text-sm">
                Cargando gastos...
              </p>
            ) : filteredExpenses.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">
                No hay gastos para el periodo seleccionado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {e.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {e.type_expense}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {e.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right font-semibold text-rose-600">
                          {formatCurrency(e.amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* INGRESOS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">
                  +
                </span>
                Detalle de Ingresos
              </h3>
              <span className="text-xs text-slate-500">
                {filteredPayments.length} registro(s)
              </span>
            </div>
            {loading ? (
              <p className="p-4 text-gray-600 text-sm">
                Cargando ingresos...
              </p>
            ) : filteredPayments.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">
                No hay ingresos para el periodo seleccionado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Depto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.departments?.number || "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {p.description || "Sin descripción"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right font-semibold text-emerald-600">
                          {formatCurrency(p.amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
