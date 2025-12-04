import { useState, FormEvent, useEffect } from "react";
import { login } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 150);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/mi-panel";
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">

      {/* PANEL IZQUIERDO — IMAGEN CORPORATIVA DE EDIFICIOS */}
      <div className="hidden md:block relative overflow-hidden">

        {/* Imagen lateral */}
        <img
          src="https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=2100&auto=format&fit=crop"
          alt="Condominio"
          className={`
            absolute inset-0 w-full h-full object-cover
            transition-all duration-[2000ms] ease-out
            ${loaded ? "scale-105 opacity-100" : "scale-100 opacity-0"}
          `}
        />

        {/* Capa de color corporativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-700/40 to-blue-500/30" />

        {/* Logo + texto sobre la imagen */}
        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
            <img
              src="/logo.jpg"
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

        {/* Frase al pie */}
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
          {/* Logo arriba en pequeño */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
            Bienvenido de nuevo
          </h2>
          <p className="text-center text-gray-500 mb-7 text-sm">
            Inicia sesión para acceder al panel de tu condominio
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-gray-700 text-sm mb-1 block">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@dominio.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm animate-shake">
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="
                w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl
                active:scale-[0.97]
              "
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} Comunidad Organizada
          </p>
        </div>
      </div>
    </div>
  );
}
