import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// 🔹 Links sueltos (NO desplegables)
const singleLinks = [
  { name: "Dashboard", path: "/", icon: "🏠" },
];

// 🔹 Administración de perfil (también sin desplegable, pero agrupados visualmente)
const profileLinks = [
  { name: "Mi Perfil", path: "/perfil", icon: "👤" },
  { name: "Configuración", path: "/configuracion", icon: "⚙️" },
];

// 🔹 Secciones desplegables
const sections = [
  {
    id: "finanzas",
    label: "Finanzas",
    items: [
      { name: "Gastos", path: "/gastos", icon: "📉" },
      { name: "Ingresos", path: "/ingresos", icon: "📈" },
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

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState(false); // sidebar abierto/cerrado en móvil
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.name || "Usuario");
      } catch {
        setUserName("Usuario");
      }
    }

    // Escucha el evento toggle-sidebar
    const handler = () => setOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);

    return () => document.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Abrir automáticamente la sección que contiene la ruta activa
  useEffect(() => {
    const newState: Record<string, boolean> = {};
    sections.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) => item.path === location.pathname
      );
      if (hasActiveItem) {
        newState[section.id] = true;
      }
    });
    setOpenSections((prev) => ({ ...prev, ...newState }));
  }, [location.pathname]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
        className={`
          fixed md:relative z-50
          w-64 h-screen bg-gray-900 text-gray-100 flex flex-col border-r border-gray-800
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header con avatar + usuario + logout */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-800 flex items-center justify-between">
          {/* Avatar + nombre */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-white">{userName}</h1>
              <p className="text-[11px] text-gray-400">Administrador</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 transition-all text-3xl"
            title="Cerrar sesión"
          >
            ⎋
          </button>
        </div>

        {/* LINKS */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto text-sm">
          {/* DASHBOARD (link suelto) */}
          <div className="mb-4 space-y-1">
            {singleLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <span className="text-lg w-6 text-center">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* SECCIONES DESPLEGABLES */}
          {sections.map((section) => {
            const isSectionOpen = openSections[section.id] ?? false;
            const sectionHasActive = section.items.some(
              (item) => item.path === location.pathname
            );

            return (
              <div key={section.id} className="mb-2">
                {/* Botón que abre/cierra */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-md mb-1
                    text-xs font-semibold tracking-wide uppercase
                    ${
                      sectionHasActive
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    }
                  `}
                >
                  <span>{section.label}</span>
                  <span className="text-[10px]">
                    {isSectionOpen ? "▴" : "▾"}
                  </span>
                </button>

                {/* Items internos */}
                {isSectionOpen && (
                  <div className="space-y-1 pl-2">
                    {section.items.map((link) => {
                      const isActive = location.pathname === link.path;

                      return (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                            ${
                              isActive
                                ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }
                          `}
                        >
                          <span className="text-lg w-6 text-center">
                            {link.icon}
                          </span>
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ADMINISTRACIÓN DE PERFIL (sin desplegable) */}
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
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <span className="text-lg w-6 text-center">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-gray-800 text-[11px] text-gray-500">
          <p>Comunidad Organizada</p>
          <p className="text-gray-600">by © Eduardo Zapata / Mamba Digital</p>
        </div>
      </aside>
    </>
  );
}
