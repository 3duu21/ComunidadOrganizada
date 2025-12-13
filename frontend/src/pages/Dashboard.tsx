// src/pages/Dashboard.tsx
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { logout as authLogout } from "../services/auth";

interface DashboardItem {
  label: string;
  description: string;
  icon: string;
  route: string;
}

const items: DashboardItem[] = [
  { label: "Condominios", description: "Administra los distintos condominios del sistema.", icon: "🏢", route: "/condominios" },
  { label: "Edificios", description: "Gestiona los edificios y su organización.", icon: "🏬", route: "/edificios" },
  { label: "Departamentos", description: "Crea, edita y organiza los departamentos.", icon: "🏠", route: "/departamentos" },
  { label: "Estacionamientos", description: "Asigna y controla estacionamientos por departamento.", icon: "🅿️", route: "/estacionamientos" },
  { label: "Gastos", description: "Registra los gastos comunes y mantenciones.", icon: "📉", route: "/gastos" },
  { label: "Ingresos", description: "Controla recaudaciones, pagos y otros ingresos.", icon: "📈", route: "/ingresos" },
  { label: "Balance", description: "Revisa el resumen financiero del condominio.", icon: "📊", route: "/balance" },
  { label: "Gastos Comunes", description: "Revisa los gastos comunes de cada departamento por periodo.", icon: "💸", route: "/gastosComunes" },
];

interface PlanInfo {
  id: string;
  name: string;
  max_condominiums: number | null;
  max_buildings_per_condo: number | null;
  max_departments_per_condo: number | null;
  allow_owner_portal: boolean;
}

type MeResponse = {
  plan?: Partial<PlanInfo>;
  // dependiendo cómo lo devuelvas en backend, puede venir en distintos lados:
  is_active?: boolean;
  plan_expires_at?: string | null;
  user?: { is_active?: boolean; plan_expires_at?: string | null };
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [isActive, setIsActive] = useState<boolean>(true);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  const handleClick = (route: string) => navigate(route);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get<MeResponse>("/me");
        const data = response.data;

        // Plan
        if (data?.plan) {
          setPlan({
            id: String(data.plan.id ?? ""),
            name: String(data.plan.name ?? "Plan"),
            max_condominiums: data.plan.max_condominiums ?? null,
            max_buildings_per_condo: data.plan.max_buildings_per_condo ?? null,
            max_departments_per_condo: data.plan.max_departments_per_condo ?? null,
            allow_owner_portal: Boolean(data.plan.allow_owner_portal),
          });
        }

        // Estado cuenta + expiración (robusto)
        const active =
          typeof data?.is_active === "boolean"
            ? data.is_active
            : typeof data?.user?.is_active === "boolean"
            ? data.user.is_active
            : true;

        const expires =
          data?.plan_expires_at ?? data?.user?.plan_expires_at ?? null;

        setIsActive(active);
        setPlanExpiresAt(expires);
      } catch (error: any) {
        // Si tu backend devuelve 403 por plan vencido,
        // aquí puedes mandar a login o mostrar bloqueo.
        console.error("Error obteniendo /me:", error);

        // Si quieres forzar logout en 401:
        if (error?.response?.status === 401) {
          authLogout();
          navigate("/login");
          return;
        }

        // Por defecto mostramos pantalla igual
        setIsActive(true);
        setPlanExpiresAt(null);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlan();
  }, [navigate]);

  const expiresMeta = useMemo(() => {
    if (!planExpiresAt) return { expired: false, daysLeft: null as number | null };

    const exp = new Date(planExpiresAt);
    const now = new Date();
    const diffMs = exp.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { expired: diffMs <= 0, daysLeft };
  }, [planExpiresAt]);

  const blocked = !isActive || expiresMeta.expired;

  const getPlanActionLabel = (planId: string) => {
    if (planId === "trial") return "contratar un plan de pago";
    if (planId === "basic") return "subir al plan Avanzado";
    return "mejorar tu plan";
  };

  const SUPPORT_EMAIL = "contacto@mambadigital.cl";
  const WHATSAPP_NUMBER = "56994833280";

  const buildEmailLink = (planName: string) => {
    const subject = `Consulta para mejorar plan (${planName})`;
    const body =
      "Hola, me gustaría obtener información para mejorar mi plan en Comunidad Organizada.";
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const buildWhatsAppLink = (planName: string) => {
    const text = `Hola, me gustaría obtener información para mejorar mi plan (${planName}) en Comunidad Organizada.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Título */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel General</h1>
            <p className="text-sm text-gray-500 mt-1">
              Elige una sección para administrar tu condominio.
            </p>
          </div>
        </div>

        {/* BLOQUEO (trial vencido / cuenta desactivada) */}
        {!loadingPlan && blocked && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-red-900">
                  ⛔ Acceso bloqueado
                </p>
                <p className="text-xs text-red-800 mt-1">
                  {!isActive
                    ? "Tu cuenta está desactivada."
                    : "Tu plan ha expirado y necesitas activarlo para seguir usando el sistema."}
                </p>

                {planExpiresAt && (
                  <p className="mt-2 text-xs text-red-800">
                    Venció el:{" "}
                    <span className="font-semibold">
                      {new Date(planExpiresAt).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildEmailLink(plan?.name ?? "Plan")}
                    className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-100 transition text-xs"
                  >
                    ✉️ Contactar por correo
                  </a>
                  <a
                    href={buildWhatsAppLink(plan?.name ?? "Plan")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 transition text-xs"
                  >
                    💬 Hablar por WhatsApp
                  </a>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800 transition text-xs"
                  >
                    ⎋ Salir
                  </button>
                </div>
                <p className="text-[10px] text-red-800">
                  Si deseas reactivar tu cuenta, contáctanos y te ayudamos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aviso plan actual (si no está bloqueado) */}
        {!loadingPlan && plan && !blocked && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Tu plan actual:{" "}
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-[2px] text-xs font-bold text-blue-700">
                    <span>★</span>
                    <span>{plan.name}</span>
                  </span>
                  {expiresMeta.daysLeft !== null && plan.id === "trial" && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-white/70 border border-blue-200 px-2 py-[2px] text-[11px] text-blue-800">
                      ⏳ {expiresMeta.daysLeft} día(s) restante(s)
                    </span>
                  )}
                </p>

                <p className="text-xs text-blue-800 mt-1">
                  Estos son los límites configurados para tu cuenta:
                </p>

                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-900">
                  {plan.max_condominiums !== null && (
                    <li>
                      • Hasta <span className="font-semibold">{plan.max_condominiums}</span> condominio(s)
                    </li>
                  )}
                  {plan.max_buildings_per_condo !== null && (
                    <li>
                      • Hasta <span className="font-semibold">{plan.max_buildings_per_condo}</span> edificios por condominio
                    </li>
                  )}
                  {plan.max_departments_per_condo !== null && (
                    <li>
                      • Hasta <span className="font-semibold">{plan.max_departments_per_condo}</span> departamentos por condominio
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

              <div className="flex flex-col sm:items-end gap-2 text-xs">
                <p className="text-blue-900">
                  ¿Necesitas administrar más?{" "}
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
                  Nuestro equipo te orientará para elegir el plan ideal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas (deshabilitadas si está bloqueado) */}
        <div
          className={`grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${
            blocked ? "opacity-60 pointer-events-none select-none" : ""
          }`}
        >
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
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>Ir a {item.label}</span>
                <span className="group-hover:text-blue-600">Ver detalles →</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
