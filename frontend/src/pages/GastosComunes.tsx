import { useEffect, useState } from "react";
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

interface PeriodSummaryItem {
    department_id: string;
    department_number: string;
    charge_amount: number;
    paid_amount: number;
    status: "pagado" | "parcial" | "no_pagado";
}

interface PeriodSummary {
    period: {
        id: string;
        year: number;
        month: number;
        status: string;
        common_fee_amount: number;
    };
    items: PeriodSummaryItem[];
}

export default function GastosComunes() {
    const [condominiums, setCondominiums] = useState<Condominium[]>([]);
    const [selectedCondoId, setSelectedCondoId] = useState<string>("");

    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

    // Año / mes seleccionados
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

    // Monto GC por depto
    const [commonFeeAmount, setCommonFeeAmount] = useState<string>("");

    // Resumen del periodo
    const [summary, setSummary] = useState<PeriodSummary | null>(null);

    const [loadingSummary, setLoadingSummary] = useState(false);
    const [openingPeriod, setOpeningPeriod] = useState(false);

    const formatCurrency = (value: number) =>
        `$${(value || 0).toLocaleString("es-CL")}`;

    const filters = {
        condominiumName:
            condominiums.find((c) => c.id === selectedCondoId)?.name || "—",
        buildingName:
            buildings.find((b) => b.id === selectedBuildingId)?.name || "—",
    };

    // ===== helpers años / meses =====
    const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

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

    // ===== carga básica =====

    const loadCondominiums = async () => {
        try {
            const res = await api.get("/condominiums");
            setCondominiums(res.data || []);
        } catch (e) {
            console.error("Error cargando condominios", e);
        }
    };

    const loadBuildings = async (condoId?: string) => {
        try {
            const res = await api.get("/buildings", {
                params: condoId ? { condominium_id: condoId } : undefined,
            });
            setBuildings(res.data || []);
        } catch (e) {
            console.error("Error cargando edificios", e);
            setBuildings([]);
        }
    };

    const loadSummaryForPeriod = async (periodId: string) => {
        try {
            setLoadingSummary(true);
            const res = await api.get(`/billing-periods/${periodId}/summary`);
            setSummary(res.data);
        } catch (e) {
            console.error("Error cargando resumen de periodo", e);
            setSummary(null);
        } finally {
            setLoadingSummary(false);
        }
    };

    // ===== 🔥 NUEVA FUNCIÓN: buscar periodo existente por building+year+month =====
    const fetchExistingPeriodSummary = async () => {
        if (!selectedBuildingId) return;

        try {
            setLoadingSummary(true);
            setSummary(null);

            const res = await api.get("/billing-periods/search", {
                params: {
                    building_id: selectedBuildingId,
                    year: selectedYear,
                    month: selectedMonth,
                },
            });

            const data: PeriodSummary = res.data;
            setSummary(data);

            // Rellenar automáticamente el monto en el input si existe en backend
            if (data?.period?.common_fee_amount) {
                setCommonFeeAmount(String(data.period.common_fee_amount));
            }
        } catch (e: any) {
            if (e.response?.status === 404) {
                // No existe el periodo → dejar el formulario limpio
                setSummary(null);
                // Opcional: limpiar el monto
                // setCommonFeeAmount("");
            } else {
                console.error("Error buscando periodo existente", e);
            }
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        loadCondominiums();
    }, []);
    // cuando ya hay edificio seleccionado y se cambia año/mes, intentamos cargar el periodo existente
    useEffect(() => {
        if (selectedBuildingId) {
            fetchExistingPeriodSummary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBuildingId, selectedYear, selectedMonth]);

    // ===== handlers filtros =====

    const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cId = e.target.value;
        setSelectedCondoId(cId);
        setSelectedBuildingId("");
        setBuildings([]);
        setSummary(null);

        if (cId) {
            loadBuildings(cId);
        }
    };

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bId = e.target.value;
        setSelectedBuildingId(bId);
        setSummary(null);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(Number(e.target.value));
        setSummary(null);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(Number(e.target.value));
        setSummary(null);
    };

    const handleClosePeriod = async () => {
        if (!summary?.period?.id) return;
        try {
            await api.patch(`/billing-periods/${summary.period.id}/close`);
            // recargamos el summary para ver el nuevo status
            await loadSummaryForPeriod(summary.period.id);
        } catch (e) {
            console.error("Error cerrando periodo", e);
        }
    };

    const handleReopenPeriod = async () => {
        if (!summary?.period?.id) return;
        try {
            await api.patch(`/billing-periods/${summary.period.id}/open`);
            await loadSummaryForPeriod(summary.period.id);
        } catch (e) {
            console.error("Error reabriendo periodo", e);
        }
    };


    // ===== abrir / actualizar periodo =====

    const handleOpenPeriod = async () => {
        if (!selectedBuildingId || !selectedCondoId) {
            alert("Debes seleccionar condominio y edificio.");
            return;
        }

        const amount = parseInt(commonFeeAmount || "0", 10);
        if (isNaN(amount) || amount <= 0) {
            alert("Ingresa un monto de gasto común válido (> 0).");
            return;
        }

        try {
            setOpeningPeriod(true);
            setSummary(null);

            const body = {
                building_id: selectedBuildingId,
                year: selectedYear,
                month: selectedMonth,
                common_fee_amount: amount,
            };

            const res = await api.post("/billing-periods/open", body);
            const period = res.data?.period;

            if (!period?.id) {
                console.error("Respuesta inesperada al abrir periodo", res.data);
                return;
            }

            // Cargar el resumen del periodo recién abierto/actualizado
            await loadSummaryForPeriod(period.id);
        } catch (e) {
            console.error("Error abriendo periodo", e);
        } finally {
            setOpeningPeriod(false);
        }
    };

    const handleRefreshSummary = async () => {
        try {
            // Si ya tenemos un periodo cargado, recargamos directo por ID
            if (summary?.period?.id) {
                await loadSummaryForPeriod(summary.period.id);
            } else if (selectedBuildingId) {
                // Si no hay summary aún, intentamos buscar el periodo existente
                await fetchExistingPeriodSummary();
            }
        } catch (e) {
            console.error("Error actualizando resumen de periodo", e);
        }
    };

    const generateSummaryPDF = () => {
        if (!summary) return;

        const doc = new jsPDF("p", "mm", "a4");

        const formatCurrencyPDF = (value: number) =>
            `$${(value || 0).toLocaleString("es-CL")}`;

        const todayLabel = new Date().toLocaleDateString("es-CL");

        const monthLabel =
            months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

        // ===== Título =====
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("RESUMEN DE GASTOS COMUNES", 105, 18, { align: "center" });

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // ===== Caja info condominio / edificio / periodo =====
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(12, 24, 120, 20);

        doc.text("Condominio Organizado", 14, 29);
        doc.text(`Condominio: ${filters.condominiumName}`, 14, 34);
        if (filters.buildingName !== "—") {
            doc.text(`Edificio: ${filters.buildingName}`, 14, 39);
        }
        doc.text(`Periodo: ${monthLabel} ${selectedYear}`, 14, 44);

        // ===== Info a la derecha =====
        doc.text(`Fecha emisión: ${todayLabel}`, 198, 29, { align: "right" });
        doc.text(
            `Estado: ${summary.period.status === "closed" ? "Cerrado" : "Abierto"
            }`,
            198,
            34,
            { align: "right" }
        );
        doc.text(
            `GC por depto: ${formatCurrencyPDF(summary.period.common_fee_amount)}`,
            198,
            39,
            { align: "right" }
        );

        // ===== Línea separadora =====
        doc.line(12, 48, 198, 48);

        // ===== Tabla =====
        const body = summary.items.map((item) => {
            const saldo =
                (item.charge_amount || 0) - (item.paid_amount || 0);

            const statusLabel =
                item.status === "pagado"
                    ? "Pagado"
                    : item.status === "parcial"
                        ? "Parcial"
                        : "No pagado";

            return [
                item.department_number || "—",
                formatCurrencyPDF(item.charge_amount),
                formatCurrencyPDF(item.paid_amount),
                formatCurrencyPDF(saldo),
                statusLabel,
            ];
        });

        autoTable(doc, {
            startY: 52,
            head: [["Depto", "Cobrado", "Pagado", "Saldo", "Estado"]],
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
                0: { cellWidth: 20 },
                1: { halign: "right" },
                2: { halign: "right" },
                3: { halign: "right" },
                4: { cellWidth: 25 },
            },
            margin: { left: 12, right: 12 },
            theme: "grid",
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 60;

        // ===== Totales =====
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

        doc.save(
            `gastos_comunes_${safeCondo}${safeBuilding}_${selectedYear}_${selectedMonth}.pdf`
        );
    };



    // ===== descargar CSV =====

    const handleDownloadCSV = async () => {
        if (!summary?.period?.id) return;

        try {
            const res = await api.get(
                `/billing-periods/${summary.period.id}/summary/export`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            const fileName = `deudas_${summary.period.year}_${summary.period.month}.csv`;

            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Error descargando CSV", e);
        }
    };

    const totalDepartments = summary?.items.length || 0;
    const totalCharged = (summary?.items || []).reduce(
        (sum, i) => sum + (i.charge_amount || 0),
        0
    );
    const totalPaid = (summary?.items || []).reduce(
        (sum, i) => sum + (i.paid_amount || 0),
        0
    );

    return (
        <div className="flex">
            <Sidebar />

            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Gastos Comunes</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Administra los periodos mensuales de gasto común y revisa el
                            estado de pago por departamento.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                        {summary && summary.period.status === "open" && (
                            <button
                                onClick={handleClosePeriod}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 text-sm flex items-center gap-2"
                            >
                                🔒 Cerrar periodo
                            </button>
                        )}

                        {summary && summary.period.status === "closed" && (
                            <button
                                onClick={handleReopenPeriod}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 text-sm flex items-center gap-2"
                            >
                                🔓 Reabrir periodo
                            </button>
                        )}

                        <button
                            onClick={handleRefreshSummary}
                            disabled={!selectedBuildingId}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            🔄 Actualizar estado
                        </button>

                        <button
                            onClick={generateSummaryPDF}
                            disabled={!summary}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            🧾 Descargar PDF
                        </button>
                    </div>


                </div>

                {/* Filtros + configuración de periodo */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Selección de periodo
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                        {/* Año */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Año
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={selectedYear}
                                onChange={handleYearChange}
                                disabled={!selectedBuildingId}
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
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                disabled={!selectedBuildingId}
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Monto GC */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Monto gasto común (por depto)
                            </label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={commonFeeAmount}
                                onChange={(e) => setCommonFeeAmount(e.target.value)}
                                disabled={!selectedBuildingId}
                                placeholder="Ej: 60000"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
                        {/* chips */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
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
                                Periodo:{" "}
                                <span className="font-semibold text-gray-700">
                                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                                    {selectedYear}
                                </span>
                            </span>
                        </div>

                        <button
                            onClick={handleOpenPeriod}
                            disabled={!selectedBuildingId || openingPeriod}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {openingPeriod ? "Guardando..." : "Abrir / Actualizar periodo"}
                        </button>
                    </div>
                </div>

                {/* Resumen tarjetas */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

                        {/* Tarjeta 1 — Monto GC + Estado */}
                        <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Monto GC por depto
                                </h3>

                                {/* Badge de estado */}
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${summary.period.status === "closed"
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {summary.period.status === "closed" ? "Cerrado" : "Abierto"}
                                </span>
                            </div>

                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(summary.period.common_fee_amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Monto asignado a cada departamento para este periodo.
                            </p>
                        </div>

                        {/* Tarjeta 2 — Número de departamentos */}
                        <div className="p-4 bg-white rounded-lg shadow border-l-4 border-indigo-500">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Número de Departamentos
                            </h3>
                            <p className="text-2xl font-bold text-indigo-600">
                                {totalDepartments}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Departamentos con deuda registrada en el periodo.
                            </p>
                        </div>

                        {/* Tarjeta 3 — Cobrado / Pagado */}
                        <div className="p-4 bg-white rounded-lg shadow border-l-4 border-green-500">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Cobrado / Pagado
                            </h3>

                            <p className="text-xs text-gray-500 mt-1 mb-1">Cobrado total:</p>
                            <p className="text-lg font-bold text-gray-800">
                                {formatCurrency(totalCharged)}
                            </p>

                            <p className="text-xs text-gray-500 mt-2 mb-1">Pagado total:</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(totalPaid)}
                            </p>
                        </div>

                    </div>
                )}

                {/* Tabla de resumen por depto */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    {loadingSummary ? (
                        <p className="p-4 text-gray-600">Cargando resumen...</p>
                    ) : !summary ? (
                        <p className="p-6 text-gray-500 text-sm">
                            Selecciona condominio, edificio, año, mes y monto de gasto común,
                            luego haz clic en{" "}
                            <span className="font-semibold">"Abrir / Actualizar periodo"</span>{" "}
                            para generar el detalle por departamento.
                        </p>
                    ) : summary.items.length === 0 ? (
                        <p className="p-6 text-gray-500 text-sm">
                            No hay departamentos con deuda registrada en este periodo.
                        </p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Depto
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Monto cobrado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Monto pagado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Saldo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {summary.items.map((item) => {
                                    const saldo =
                                        (item.charge_amount || 0) - (item.paid_amount || 0);

                                    const statusLabel =
                                        item.status === "pagado"
                                            ? "Pagado"
                                            : item.status === "parcial"
                                                ? "Parcial"
                                                : "No pagado";

                                    const statusColor =
                                        item.status === "pagado"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "parcial"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700";

                                    return (
                                        <tr key={item.department_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {item.department_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {formatCurrency(item.charge_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {formatCurrency(item.paid_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {formatCurrency(saldo)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
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
            </main>
        </div>
    );
}
