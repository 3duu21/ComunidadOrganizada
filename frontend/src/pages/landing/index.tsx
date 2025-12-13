import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupTrial } from "../../services/auth";
import api from "../../services/api";
import logo from "../../images/logo.png";

type SelectedPlan = "Trial" | "Básico" | "Avanzado" | null;

export default function LandingPage() {
  const navigate = useNavigate();

  // 🔹 Estado modal TRIAL
  const [openTrialModal, setOpenTrialModal] = useState(false);
  const [trialName, setTrialName] = useState("");
  const [trialEmail, setTrialEmail] = useState("");
  const [trialPassword, setTrialPassword] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  // 🔹 Estado FORMULARIO DE CONTACTO
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactUnits, setContactUnits] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // 🔹 Plan seleccionado desde “Planes”
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>(null);

  const selectedPlanMeta = useMemo(() => {
    if (!selectedPlan) return null;

    if (selectedPlan === "Trial") {
      return {
        title: "Plan Trial (14 días)",
        helper:
          "Ideal para conocer el sistema. Te dejamos listo un acceso administrador para partir.",
      };
    }
    if (selectedPlan === "Básico") {
      return {
        title: "Plan Básico (mensual)",
        helper:
          "Perfecto si administras 1 condominio/edificio y quieres ordenar gastos comunes y PDF sin Excel.",
      };
    }
    return {
      title: "Plan Avanzado (mensual)",
      helper:
        "Pensado para administradores que quieren profesionalizar su servicio con portal de propietarios y menos reclamos.",
    };
  }, [selectedPlan]);

  const handleOpenTrial = () => {
    setTrialError(null);
    setTrialName("");
    setTrialEmail("");
    setTrialPassword("");
    setOpenTrialModal(true);
  };

  // 🔹 Click en “Quiero este plan” (no rompe nada, solo rellena contacto)
  const handleChoosePlan = (plan: Exclude<SelectedPlan, null>) => {
    setSelectedPlan(plan);

    // Autocompletamos sugerencias sin obligar nada
    if (!contactRole.trim()) setContactRole("Administrador");
    if (!contactMessage.trim()) {
      const base =
        plan === "Avanzado"
          ? "Hola, me interesa el Plan Avanzado con portal de propietarios. ¿Podemos coordinar una demo y ver la implementación?"
          : plan === "Básico"
          ? "Hola, me interesa el Plan Básico. ¿Podemos coordinar una demo y ver si calza con mi comunidad?"
          : "Hola, quiero probar el Trial. ¿Me puedes orientar para partir?";
      setContactMessage(base);
    }

    // Bajamos a contacto (sin router, solo anchor)
    window.location.hash = "#contact";
  };

  // 🔹 Envío formulario de CONTACTO
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (contactSending) return;

    setContactError(null);

    const nameTrimmed = contactName.trim();
    const emailTrimmed = contactEmail.trim();

    if (!nameTrimmed || !emailTrimmed) {
      setContactError("Nombre y correo son obligatorios.");
      return;
    }

    // Incluimos plan seleccionado (si existe) para que te llegue en el mail
    const payload = {
      name: nameTrimmed,
      email: emailTrimmed,
      role: contactRole.trim(),
      units: contactUnits.trim(),
      message: contactMessage.trim(),
      plan: selectedPlan || undefined,
    };

    try {
      setContactSending(true);
      await api.post("/contact", payload);

      alert("Mensaje enviado correctamente. Te contactaremos pronto.");

      // limpiar formulario
      setContactName("");
      setContactEmail("");
      setContactRole("");
      setContactUnits("");
      setContactMessage("");
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      setContactError("Hubo un problema al enviar tu mensaje. Intenta nuevamente.");
    } finally {
      setContactSending(false);
    }
  };

  // 🔹 Envío formulario TRIAL (crear cuenta de prueba)
  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trialLoading) return;

    setTrialError(null);

    const nameTrimmed = trialName.trim();
    const emailTrimmed = trialEmail.trim();
    const passwordTrimmed = trialPassword.trim();

    if (!nameTrimmed || !emailTrimmed || !passwordTrimmed) {
      setTrialError("Todos los campos son obligatorios.");
      return;
    }

    if (passwordTrimmed.length < 6) {
      setTrialError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setTrialLoading(true);
      await signupTrial({
        name: nameTrimmed,
        email: emailTrimmed,
        password: passwordTrimmed,
      });

      setOpenTrialModal(false);
      navigate("/"); // panel admin
    } catch (err: any) {
      console.error("Error creando trial:", err);
      const msg =
        err?.response?.data?.message ||
        "No se pudo crear la cuenta de prueba. Intenta con otro correo.";
      setTrialError(msg);
    } finally {
      setTrialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-slate-900">
              <img src={logo} alt="Logo Comunidad Organizada" className="rounded-3xl"/>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Comunidad Organizada</p>
              <p className="text-xs text-slate-400">Gestión de condominios en un solo lugar</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-emerald-400">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-emerald-400">Cómo funciona</a>
            <a href="#pricing" className="hover:text-emerald-400">Planes</a>
            <a href="#contact" className="hover:text-emerald-400">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400 md:inline">
              <Link to="/login">Iniciar sesión</Link>
            </button>

            {/* BOTÓN PROBAR DEMO → abre modal */}
            <button
              onClick={handleOpenTrial}
              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Probar demo
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center md:pb-24 md:pt-16">
            {/* Texto */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-slate-900/60 px-3 py-1 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Software para administradores de edificios y condominios
              </div>

              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                Centraliza la gestión de tu condominio,
                <span className="block text-emerald-400">
                  ahorra tiempo y controla mejor tus gastos comunes.
                </span>
              </h1>

              {/* ✅ Copy pulido: beneficio directo */}
              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Deja atrás el Excel, ordena tus cobros y reduce reclamos con un sistema claro para ti
                y para tus propietarios.
              </p>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Comunidad Organizada es un sistema web que conecta al administrador con los propietarios:
                genera gastos comunes, registra pagos, controla morosidad y entrega paneles claros para cada actor,
                todo desde un solo lugar.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Agendar demo gratuita
                </a>
                <button className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400">
                  <a href="#comofunciona">Ver cómo funciona</a>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-center text-[10px] leading-5 text-emerald-300">✓</span>
                  Sin instalación, 100% web
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-center text-[10px] leading-5 text-emerald-300">✓</span>
                  Diseñado para la realidad chilena
                </div>
                {/* ✅ Copy pulido */}
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-center text-[10px] leading-5 text-emerald-300">✓</span>
                  Menos llamadas, más control
                </div>
              </div>
            </div>

            {/* “Mockup” del sistema */}
            <div className="flex-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-emerald-500/10">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <span className="text-xs text-slate-400">
                    Panel Administrador · Comunidad Organizada
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs font-semibold text-slate-200">Resumen mensual</p>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Gastos comunes generados</span>
                        <span className="font-semibold text-emerald-400">$8.540.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pagado</span>
                        <span className="font-semibold text-emerald-400">76%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Departamentos morosos</span>
                        <span className="font-semibold text-rose-400">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs font-semibold text-slate-200">Panel propietario (vista ejemplo)</p>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-100">Dpto. 304 · Torre A</p>
                          <p className="text-[11px] text-slate-400">Estado: al día</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
                          Pagado
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-t border-slate-800 pt-2">
                        <div>
                          <p className="text-[11px] text-slate-400">Último pago</p>
                          <p>05 / 12 / 2025</p>
                        </div>
                        <button className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] hover:border-emerald-500 hover:text-emerald-300">
                          Descargar comprobante
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[11px] text-slate-400 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5">
                    Cierre de mes con un clic
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5">
                    PDF de gastos comunes automáticos
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5">
                    Multi-condominio y multi-edificio
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
                Todo lo que necesitas para administrar tu comunidad
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Hecho desde la práctica: menos tiempo “apagando incendios” y más control de tu operación.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                title="Panel administrador"
                description="Ordena tu operación: condominios, edificios, departamentos, gastos comunes y pagos, todo en un solo panel."
                items={[
                  "Multi-condominio y multi-edificio",
                  "Historial claro de gastos e ingresos",
                  "Morosidad visible al instante",
                ]}
              />
              <FeatureCard
                title="Panel propietarios"
                description="Disminuye llamadas y correos: cada propietario revisa su estado, pagos y documentos cuando quiera."
                items={[
                  "Acceso con usuario y contraseña",
                  "Transparencia para evitar conflictos",
                  "Menos gestión repetitiva para ti",
                ]}
              />
              <FeatureCard
                title="Reportes y documentación"
                description="PDF automáticos y reportes listos para comité, reuniones o respaldo contable."
                items={[
                  "Gastos comunes en PDF",
                  "Reportes por periodo",
                  "Exportación para respaldo",
                ]}
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-b border-slate-800 bg-slate-950/90">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div id="comofunciona" className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-50">Cómo funciona</h2>
              <p className="mt-2 text-sm text-slate-300">
                En pocos pasos puedes tener tu comunidad cargada y operando.
              </p>
            </div>

            <ol className="grid gap-6 md:grid-cols-3">
              <StepCard
                number="1"
                title="Configura tu condominio"
                description="Crea condominio, edificios y departamentos. Ordena tu estructura desde el día 1."
              />
              <StepCard
                number="2"
                title="Carga gastos y genera cobros"
                description="Registra gastos del periodo y genera automáticamente los cobros de gasto común."
              />
              <StepCard
                number="3"
                title="Comparte acceso y controla pagos"
                description="Propietarios ven su estado (menos preguntas) y tú controlas morosidad en tiempo real."
              />
            </ol>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section id="pricing" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
                  Planes pensados para administradores reales
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Parte simple y escala cuando tu cartera crezca. Sin letra chica.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <PriceCard
                name="Trial"
                highlight={false}
                description="Prueba el sistema y evalúa si calza con tu operación."
                price="$0"
                period="por 14 días"
                items={[
                  "1 condominio",
                  "Hasta 10 departamentos",
                  "Panel administrador",
                  "Ideal para conocer el flujo",
                ]}
                onChoose={() => handleChoosePlan("Trial")}
              />
              <PriceCard
                name="Básico"
                highlight
                description="Para ordenar gastos comunes sin complicarte."
                price="$19.990"
                period="mensual"
                items={[
                  "1 condominio",
                  "Hasta 40 departamentos",
                  "Reportes en PDF",
                  "Soporte por WhatsApp",
                  "Perfecto para 1 edificio",
                ]}
                onChoose={() => handleChoosePlan("Básico")}
              />
              <PriceCard
                name="Avanzado"
                highlight={false}
                description="Para administradores que quieren profesionalizar su servicio."
                price="$34.990"
                period="mensual"
                items={[
                  "Hasta 3 condominios",
                  "Portal de propietarios",
                  "Control de morosidad",
                  "Reportes avanzados",
                  "Menos llamadas y reclamos",
                ]}
                onChoose={() => handleChoosePlan("Avanzado")}
              />
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contact" className="bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
                  Conversemos sobre tu comunidad
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Déjanos tus datos y coordinamos una demo. Te ayudamos a partir rápido.
                </p>

                <div className="mt-6 space-y-2 text-sm text-slate-300">
                  <p>📍 Chile</p>
                  <p>📧 contacto@mambadigital.cl</p>
                  <p>📱 +56 9 94833280</p>
                </div>

                {/* ✅ Caja “plan seleccionado” */}
                {selectedPlanMeta && (
                  <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold text-emerald-300">
                      Seleccionaste: {selectedPlanMeta.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {selectedPlanMeta.helper}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="mt-3 rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
                    >
                      Cambiar / quitar selección
                    </button>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleContactSubmit}
                className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Nombre y apellido
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                    placeholder="Tu nombre completo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    disabled={contactSending}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                    placeholder="tucorreo@ejemplo.cl"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={contactSending}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Rol / cargo
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                      placeholder="Administrador, Comité, etc."
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      disabled={contactSending}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      N° de departamentos aprox.
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                      placeholder="Ej: 80"
                      value={contactUnits}
                      onChange={(e) => setContactUnits(e.target.value)}
                      disabled={contactSending}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Comentarios
                  </label>
                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                    placeholder="Cuéntanos brevemente cómo administras hoy tu condominio y qué te gustaría mejorar."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    disabled={contactSending}
                  />
                </div>

                {contactError && <p className="text-[11px] text-rose-400">{contactError}</p>}

                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {contactSending ? "Enviando..." : "Enviar y solicitar demo"}
                </button>

                <p className="text-[11px] text-slate-400">
                  Al enviar aceptas ser contactado sólo para coordinar una demo o entregarte información del sistema. Nada de spam.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-[11px] text-slate-500 md:flex-row">
          <span>© {new Date().getFullYear()} Comunidad Organizada.</span>
          <div className="flex gap-4">
            <button className="hover:text-emerald-400">Términos y condiciones</button>
            <button className="hover:text-emerald-400">Política de datos</button>
          </div>
        </div>
      </footer>

      {/* MODAL TRIAL */}
      {openTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-50">Crear cuenta de prueba</h3>
              <button
                onClick={() => setOpenTrialModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-300">
              Crea un acceso como administrador y prueba Comunidad Organizada gratis por 14 días.
            </p>

            <form onSubmit={handleTrialSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-300">
                  Nombre y apellido
                </label>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                  placeholder="Tu nombre completo"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  disabled={trialLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                  placeholder="tucorreo@ejemplo.cl"
                  value={trialEmail}
                  onChange={(e) => setTrialEmail(e.target.value)}
                  disabled={trialLoading}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                  placeholder="Mínimo 6 caracteres"
                  value={trialPassword}
                  onChange={(e) => setTrialPassword(e.target.value)}
                  disabled={trialLoading}
                />
              </div>

              {trialError && <p className="text-[11px] text-rose-400">{trialError}</p>}

              <button
                type="submit"
                disabled={trialLoading}
                className="mt-2 w-full rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:opacity-60"
              >
                {trialLoading ? "Creando cuenta..." : "Crear cuenta de prueba"}
              </button>

              <p className="text-[10px] text-slate-500 mt-1">
                Te crearemos un acceso como administrador con un condominio de ejemplo. Podrás cambiar los datos luego.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTES AUXILIARES

type FeatureCardProps = {
  title: string;
  description: string;
  items: string[];
};

function FeatureCard({ title, description, items }: FeatureCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-xs text-slate-300">{description}</p>
      <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <li className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
        {number}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-xs text-slate-300">{description}</p>
    </li>
  );
}

type PriceCardProps = {
  name: string;
  description: string;
  price: string;
  period: string;
  items: string[];
  highlight?: boolean;
  onChoose?: () => void;
};

function PriceCard({ name, description, price, period, items, highlight, onChoose }: PriceCardProps) {
  return (
    <div
      className={[
        "flex flex-col rounded-2xl border bg-slate-900/70 p-4",
        highlight ? "border-emerald-500/70 shadow-lg shadow-emerald-500/30" : "border-slate-800",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-50">{name}</h3>
        {highlight && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            Más elegido
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300">{description}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-slate-50">{price}</span>
        <span className="text-[11px] text-slate-400">/ {period}</span>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onChoose}
        className="text-center mt-5 w-full rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-emerald-500 hover:text-emerald-300"
      >
        Quiero este plan
      </button>
    </div>
  );
}
