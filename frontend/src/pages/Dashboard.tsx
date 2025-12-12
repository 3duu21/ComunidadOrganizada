// src/pages/Dashboard.tsx
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

interface DashboardItem {
  label: string;
  description: string;
  icon: string; // por ahora usaremos emojis, así no agregas librerías
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
  {
    label: "Gastos Comunes",
    description:
      "Revisa los gastos comunes de cada departamento por periodo.",
    icon: "💸",
    route: "/gastosComunes",
  },
];

interface PlanInfo {
  id: string;
  name: string;
  max_condominiums: number | null;
  max_buildings_per_condo: number | null;
  max_departments_per_condo: number | null;
  allow_owner_portal: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const handleClick = (route: string) => {
    navigate(route);
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get("/me");
        const data = response.data;

        if (data?.plan) {
          setPlan({
            id: data.plan.id,
            name: data.plan.name,
            max_condominiums: data.plan.max_condominiums ?? null,
            max_buildings_per_condo: data.plan.max_buildings_per_condo ?? null,
            max_departments_per_condo:
              data.plan.max_departments_per_condo ?? null,
            allow_owner_portal: Boolean(data.plan.allow_owner_portal),
          });
        }
      } catch (error) {
        console.error("Error obteniendo plan desde /me:", error);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlan();
  }, []);

  // Texto de acción según el plan
  const getPlanActionLabel = (planId: string) => {
    if (planId === "trial") return "contratar un plan de pago";
    if (planId === "basic") return "subir al plan Avanzado";
    return "mejorar tu plan";
  };

  // ⚠️ Cambia estos datos por los tuyos
  const SUPPORT_EMAIL = "contacto@mambadigital.cl";
  const WHATSAPP_NUMBER = "56994833280"; // sin + ni espacios para wa.me

  const buildEmailLink = (planName: string) => {
    const subject = `Consulta para mejorar plan (${planName})`;
    const body =
      "Hola, me gustaría obtener información para mejorar mi plan en Comunidad Organizada.";
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const buildWhatsAppLink = (planName: string) => {
    const text = `Hola, me gustaría obtener información para mejorar mi plan (${planName}) en Comunidad Organizada.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        {/* Título principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel General</h1>
            <p className="text-sm text-gray-500 mt-1">
              Elige una sección para administrar tu condominio.
            </p>
          </div>
        </div>

        {/* Aviso de plan actual + botón de contacto */}
        {!loadingPlan && plan && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Tu plan actual:{" "}
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-[2px] text-xs font-bold text-blue-700">
                    <span>★</span>
                    <span>{plan.name}</span>
                  </span>
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Estos son los límites configurados para tu cuenta:
                </p>

                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-900">
                  {plan.max_condominiums !== null && (
                    <li>
                      • Hasta{" "}
                      <span className="font-semibold">
                        {plan.max_condominiums}
                      </span>{" "}
                      condominio(s)
                    </li>
                  )}
                  {plan.max_buildings_per_condo !== null && (
                    <li>
                      • Hasta{" "}
                      <span className="font-semibold">
                        {plan.max_buildings_per_condo}
                      </span>{" "}
                      edificios por condominio
                    </li>
                  )}
                  {plan.max_departments_per_condo !== null && (
                    <li>
                      • Hasta{" "}
                      <span className="font-semibold">
                        {plan.max_departments_per_condo}
                      </span>{" "}
                      departamentos por condominio
                    </li>
                  )}
                  <li>
                    • Portal de propietarios:{" "}
                    <span className="font-semibold">
                      {plan.allow_owner_portal ? "Habilitado" : "No incluido"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Botones de contacto / mejorar plan */}
              <div className="flex flex-col sm:items-end gap-2 text-xs">
                <p className="text-blue-900">
                  ¿Necesitas administrar más condominios, edificios o
                  departamentos?{" "}
                  <span className="font-semibold">
                    Puedes {getPlanActionLabel(plan.id)}.
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildEmailLink(plan.name)}
                    className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 border border-blue-300 text-blue-700 hover:bg-blue-50 transition text-xs"
                  >
                    ✉️ Contactar por correo
                  </a>
                  <a
                    href={buildWhatsAppLink(plan.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 text-white hover:bg-green-600 transition text-xs"
                  >
                    💬 Hablar por WhatsApp
                  </a>
                </div>
                <p className="text-[10px] text-blue-800">
                  Nuestro equipo te orientará para elegir el plan que mejor se
                  ajuste a tu condominio.
                </p>
              </div>
            </div>
          </div>
        )}

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
