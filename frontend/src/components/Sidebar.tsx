// src/components/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, logout as authLogout } from "../services/auth";
import api from "../services/api";
import logo from "../images/logo.png";

// 🔹 Links admin sueltos
const adminSingleLinks = [{ name: "Dashboard", path: "/", icon: "🏠" }];

// 🔹 Links admin de perfil
const profileLinks = [
  { name: "Mi Perfil", path: "/perfil", icon: "👤" },
  { name: "Configuración", path: "/configuracion", icon: "⚙️" },
];

// 🔹 Secciones desplegables para ADMIN
const adminSections = [
  {
    id: "finanzas",
    label: "Finanzas",
    items: [
      { name: "Gastos", path: "/gastos", icon: "📉" },
      { name: "Ingresos", path: "/ingresos", icon: "📈" },
      { name: "Gastos Comunes", path: "/gastosComunes", icon: "💸" },
      { name: "Balance", path: "/balance", icon: "📊" },
    ],
  },
  {
    id: "propiedades",
    label: "Gestión de Condominios",
    items: [
      { name: "Condominios", path: "/condominios", icon: "🏘️" },
      { name: "Edificios", path: "/edificios", icon: "🏬" },
      { name: "Departamentos", path: "/departamentos", icon: "🏢" },
      { name: "Estacionamientos", path: "/estacionamientos", icon: "🅿️" },
    ],
  },
];

// 🔹 Menú OWNER (propietario)
const ownerLinks = [
  { name: "Mi Panel", path: "/mi-panel", icon: "📊" },
  { name: "Mis Pagos", path: "/mis-pagos", icon: "💳" },
  { name: "Mis gastos comunes", path: "/mis-gastos-comunes", icon: "🧾" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState<"admin" | "owner">("admin");
  const [planName, setPlanName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.name || "Usuario");
      setUserRole(user.role);
    }

    const fetchMe = async () => {
      try {
        const response = await api.get("/me");
        const data = response.data;
        if (data?.plan?.name) setPlanName(data.plan.name);
        else if (data?.plan?.id) setPlanName(String(data.plan.id));
      } catch (err) {
        console.error("Error al obtener /me para mostrar plan:", err);
      }
    };

    fetchMe();

    const handler = () => setOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);

    // ✅ Cerrar con ESC (pro)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("toggle-sidebar", handler);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Abrir automáticamente la sección admin que contiene la ruta activa
  useEffect(() => {
    if (userRole !== "admin") return;

    const newState: Record<string, boolean> = {};
    adminSections.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) => item.path === location.pathname
      );
      if (hasActiveItem) newState[section.id] = true;
    });

    setOpenSections((prev) => ({ ...prev, ...newState }));
  }, [location.pathname, userRole]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  const roleLabel = userRole === "admin" ? "Administrador" : "Propietario";

  return (
    <>
      {/* OVERLAY para móviles */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* BOTÓN HAMBURGER SOLO PARA MÓVIL */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        onClick={() =>
          document.dispatchEvent(new CustomEvent("toggle-sidebar"))
        }
      >
        ☰
      </button>

      <aside
        className={`fixed md:sticky md:top-0 z-50
    w-64 bg-gray-900 text-gray-100 flex flex-col border-r border-gray-800
    transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    h-dvh md:h-screen overflow-hidden
  `}
      >

        {/* Header pegado */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md shrink-0">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate">
                {userName}
              </h1>
              <p className="text-[11px] text-gray-400 truncate">{roleLabel}</p>

              {planName && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-900/40 border border-blue-500/40 px-2 py-[2px] text-[10px] text-blue-300">
                  <span className="text-[9px]">★</span>
                  <span className="truncate">Plan: {planName}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-all text-3xl"
            title="Cerrar sesión"
          >
            ⎋
          </button>
        </div>

        {/* ✅ Menú con scroll interno (no se corta nunca) */}
        <nav
          className="
            flex-1 px-3 py-5 text-sm
            overflow-y-auto overscroll-contain
            [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.35)_transparent]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-400/20
            [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/30
          "
        >
          {/* Link suelto */}
          <div className="mb-4 space-y-1">
            {(userRole === "admin" ? adminSingleLinks : ownerLinks).map(
              (link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${isActive
                        ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                  >
                    <span className="text-lg w-6 text-center shrink-0">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              }
            )}
          </div>

          {/* Secciones admin */}
          {userRole === "admin" &&
            adminSections.map((section) => {
              const isSectionOpen = openSections[section.id] ?? false;
              const sectionHasActive = section.items.some(
                (item) => item.path === location.pathname
              );

              return (
                <div key={section.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md mb-1
                      text-xs font-semibold tracking-wide uppercase
                      ${sectionHasActive
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                      }`}
                  >
                    <span className="truncate">{section.label}</span>
                    <span className="text-[10px] shrink-0">
                      {isSectionOpen ? "▴" : "▾"}
                    </span>
                  </button>

                  {isSectionOpen && (
                    <div className="space-y-1 pl-2">
                      {section.items.map((link) => {
                        const isActive = location.pathname === link.path;

                        return (
                          <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                              ${isActive
                                ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                              }`}
                          >
                            <span className="text-lg w-6 text-center shrink-0">
                              {link.icon}
                            </span>
                            <span className="truncate">{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Perfil */}
          <div className="mt-4 pt-3 border-t border-gray-800">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Administración de Perfil
            </p>
            <div className="space-y-1">
              {profileLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${isActive
                        ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                  >
                    <span className="text-lg w-6 text-center shrink-0">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer pegado */}
        <div className="px-4 py-3 border-t border-gray-800 text-[11px] text-gray-500">
          <p>Comunidad Organizada</p>
          <p className="text-gray-600">by © Eduardo Zapata / Mamba Digital</p>
        </div>
      </aside>
    </>
  );
}
