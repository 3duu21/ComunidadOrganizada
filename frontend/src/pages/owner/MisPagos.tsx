// src/pages/owner/MisPagos.tsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

interface OwnerPayment {
  id: string;
  date: string;
  amount: number;
  type_income: string;
  payment_method: string;
  description: string | null;
  department_number: string;
}

export default function MisPagos() {
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) =>
    `$${(value || 0).toLocaleString("es-CL")}`;

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/payments");
      setPayments(res.data || []);
    } catch (e) {
      console.error("Error cargando pagos del propietario", e);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Mis Pagos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Revisa el detalle de los pagos registrados para tus departamentos.
            </p>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Total Pagado
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Suma de todos los pagos registrados.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Número de Pagos
            </h3>
            <p className="text-2xl font-bold text-blue-500">
              {payments.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Movimientos encontrados en el sistema.
            </p>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-gray-600">Cargando pagos...</p>
          ) : payments.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No hay pagos registrados para tus departamentos.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.department_number || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.type_income || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.payment_method || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.description || "Sin descripción"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-green-600">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
