import { useState, FormEvent, useEffect } from "react";
import { login, getCurrentUser } from "../services/auth";
import logo from "../images/logo.png";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function Login() {
  // 👇 En producción, NO dejar credenciales prellenadas
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Animación
    const timer = setTimeout(() => setLoaded(true), 150);

    // 🔐 Si ya está logeado, redirigir al panel que corresponda
    const user = getCurrentUser();
    if (user) {
      if (user.role === "admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/mi-panel";
      }
    }

    return () => clearTimeout(timer);
  }, []);

  function validate(): boolean {
    const errs: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Formato de correo inválido";
    }

    if (!password) {
      errs.password = "Ingresa tu contraseña";
    } else if (password.length < 5) {
      errs.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;
    if (loading) return;

    try {
      setLoading(true);
      const user = await login(email.trim(), password);

      if (user.role === "admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/mi-panel";
      }
    } catch (err: any) {
      // Mensaje genérico para no revelar detalles de seguridad
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">

      {/* PANEL IZQUIERDO — IMAGEN CORPORATIVA DE EDIFICIOS */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1700126689261-1f5bdfe5adcc?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Condominio"
          className={`
            absolute inset-0 w-full h-full object-cover
            transition-all duration-[2000ms] ease-out
            ${loaded ? "scale-105 opacity-100" : "scale-100 opacity-0"}
          `}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-blue-700/40 to-blue-500/30" />

        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Panel de Gestión
            </p>
            <h1 className="text-2xl font-bold drop-shadow">
              Comunidad Organizada
            </h1>
          </div>
        </div>

        <div className="absolute bottom-10 left-8 text-white max-w-sm">
          <p className="text-2xl font-semibold drop-shadow-md">
            Controla ingresos, gastos y edificios desde un solo lugar.
          </p>
          <p className="text-lg text-white/80 mt-1">
            Gestión transparente y ordenada para tu comunidad.
          </p>
        </div>
      </div>

      {/* PANEL DERECHO — LOGIN */}
      <div className="flex items-center justify-center px-6 py-10 bg-gradient-to-br from-blue-50 to-gray-200">
        <div
          className={`
            w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 border border-gray-200
            transform transition-all duration-700 ease-out
            ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
            Bienvenido de nuevo
          </h2>
          <p className="text-center text-gray-500 mb-7 text-sm">
            Inicia sesión para acceder al panel de tu condominio
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm mb-1 block">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-lg border 
                  ${fieldErrors.email ? "border-red-400" : "border-gray-300"}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all outline-none`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@dominio.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className={`w-full px-4 py-3 rounded-lg border 
                  ${fieldErrors.password ? "border-red-400" : "border-gray-300"}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-all outline-none`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <p className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm animate-shake">
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl
                active:scale-[0.97]
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Nunca compartas tu contraseña. © {new Date().getFullYear()} Comunidad Organizada
          </p>
        </div>
      </div>
    </div>
  );
}
