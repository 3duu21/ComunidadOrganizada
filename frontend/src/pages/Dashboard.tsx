import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

interface DashboardItem {
  label: string;
  description: string;
  icon: string;      // por ahora usaremos emojis, así no agregas librerías
  route: string;
}

const items: DashboardItem[] = [
  {
    label: "Condominios",
    description: "Administra los distintos condominios del sistema.",
    icon: "🏢",
    route: "/condominios",
  },
  {
    label: "Edificios",
    description: "Gestiona los edificios y su organización.",
    icon: "🏬",
    route: "/edificios",
  },
  {
    label: "Departamentos",
    description: "Crea, edita y organiza los departamentos.",
    icon: "🏠",
    route: "/departamentos",
  },
  {
    label: "Estacionamientos",
    description: "Asigna y controla estacionamientos por departamento.",
    icon: "🅿️",
    route: "/estacionamientos",
  },
  {
    label: "Gastos",
    description: "Registra los gastos comunes y mantenciones.",
    icon: "📉",
    route: "/gastos",
  },
  {
    label: "Ingresos",
    description: "Controla recaudaciones, pagos y otros ingresos.",
    icon: "📈",
    route: "/ingresos",
  },
  {
    label: "Balance",
    description: "Revisa el resumen financiero del condominio.",
    icon: "📊",
    route: "/balance",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        {/* Título principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Panel General
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Elige una sección para administrar tu condominio.
            </p>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item.route)}
              className="group text-left bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 hover:border-blue-300 p-5 flex flex-col justify-between h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                    {item.label}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>Ir a {item.label}</span>
                <span className="group-hover:text-blue-600">
                  Ver detalles &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
