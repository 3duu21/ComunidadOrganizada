import { Link } from "react-router-dom";

export default function PlanVencido() {
  const SUPPORT_EMAIL = "contacto@mambadigital.cl";
  const WHATSAPP_NUMBER = "56994833280";

  const emailLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Plan vencido - Comunidad Organizada"
  )}&body=${encodeURIComponent(
    "Hola, mi trial venció y necesito activar un plan de pago."
  )}`;

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola, mi trial venció y necesito activar un plan en Comunidad Organizada."
  )}`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-gray-900">⛔ Plan vencido</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tu acceso fue bloqueado porque tu trial expiró o tu cuenta fue desactivada.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={emailLink}
            className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 text-sm"
          >
            ✉️ Contactar por correo
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700 text-sm"
          >
            💬 WhatsApp
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 text-sm"
          >
            🔑 Volver a iniciar sesión
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Si ya contrataste un plan, contáctanos y reactivamos tu cuenta.
        </p>
      </div>
    </div>
  );
}
