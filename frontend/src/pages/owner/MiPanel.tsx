// src/pages/owner/MiPanel.tsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

interface OwnerDepartment {
  id: string;
  number: string;
  building_id: string;
}

interface OwnerPayment {
  id: string;
  date: string;
  amount: number;
  type_income: string;
  payment_method: string;
  description: string | null;
  department_number: string;
}

export default function MiPanel() {
  const [departments, setDepartments] = useState<OwnerDepartment[]>([]);
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) =>
    `$${(value || 0).toLocaleString("es-CL")}`;

  const totalPagado = useMemo(
    () => payments.reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

  const ultimoPago = payments[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [depsRes, paysRes] = await Promise.all([
        api.get("/owner/departments"),
        api.get("/owner/payments"),
      ]);

      setDepartments(depsRes.data || []);
      setPayments(paysRes.data || []);
    } catch (e) {
      console.error("Error cargando panel de propietario", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Mi Panel</h2>
          <p className="text-sm text-gray-500 mt-1">
            Resumen rápido de tus departamentos, pagos y movimiento reciente.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Cargando información...</p>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Mis departamentos
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {departments.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Departamentos asociados a tu cuenta.
                </p>
                {departments.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600">
                    {departments.map((d) => (
                      <li key={d.id}>• Depto {d.number}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-white rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Total pagado registrado
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPagado)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Suma de todos los pagos registrados en el sistema.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow border-l-4 border-indigo-500">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Último pago
                </h3>
                {ultimoPago ? (
                  <>
                    <p className="text-lg font-bold text-indigo-600">
                      {formatCurrency(ultimoPago.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha: {ultimoPago.date}
                    </p>
                    <p className="text-xs text-gray-500">
                      Depto: {ultimoPago.department_number || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tipo: {ultimoPago.type_income || "—"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Aún no hay pagos registrados.
                  </p>
                )}
              </div>
            </div>

            {/* Tabla de últimos pagos */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Últimos pagos
                </h3>
                <p className="text-xs text-gray-500">
                  Se muestran tus últimos movimientos registrados.
                </p>
              </div>

              {payments.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No hay pagos registrados para tus departamentos.
                </p>
              ) : (
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
                        Tipo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.slice(0, 10).map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.date}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.department_number || "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.type_income || "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {p.payment_method || "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-gray-800 font-semibold">
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
