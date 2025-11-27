import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const links = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Gastos", path: "/gastos", icon: "📉" },
  { name: "Ingresos", path: "/ingresos", icon: "📈" },
  { name: "Departamentos", path: "/departamentos", icon: "🏢" },
  { name: "Edificios", path: "/edificios", icon: "🏬" },
  { name: "Condominios", path: "/condominios", icon: "🏘️" },
  { name: "Estacionamientos", path: "/estacionamientos", icon: "🅿️" },
  { name: "Balance", path: "/balance", icon: "📊" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState(false);

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
        onClick={() => document.dispatchEvent(new CustomEvent("toggle-sidebar"))}
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

        {/* Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setOpen(false)} // cerrar sidebar al navegar en móvil
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                  ${isActive
                    ? "bg-gray-800 text-blue-400 border border-blue-500/60"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <span className="text-lg w-6 text-center">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-800 text-[11px] text-gray-500">
          <p>Comunidad Organizada</p>
          <p className="text-gray-600">by © Eduardo Zapata / Mamba Digital</p>
        </div>
      </aside>
    </>
  );
}
