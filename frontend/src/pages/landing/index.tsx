import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-900">
              CO
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Comunidad Organizada
              </p>
              <p className="text-xs text-slate-400">
                Gestión de condominios en un solo lugar
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-emerald-400">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400">
              Cómo funciona
            </a>
            <a href="#pricing" className="hover:text-emerald-400">
              Planes
            </a>
            <a href="#contact" className="hover:text-emerald-400">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400 md:inline">
              Iniciar sesión
            </button>
            <button className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400">
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

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Comunidad Organizada es un sistema web que conecta al
                administrador con los propietarios: genera gastos comunes,
                registra pagos, controla morosidad y entrega paneles claros para
                cada actor, todo desde un solo lugar.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400">
                  Agendar demo gratuita
                </button>
                <button className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-400">
                  Ver cómo funciona
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-center text-[10px] leading-5 text-emerald-300">
                    ✓
                  </span>
                  Sin instalación, 100% web
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-center text-[10px] leading-5 text-emerald-300">
                    ✓
                  </span>
                  Diseñado para la realidad chilena
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
                    <p className="text-xs font-semibold text-slate-200">
                      Resumen mensual
                    </p>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Gastos comunes generados</span>
                        <span className="font-semibold text-emerald-400">
                          $8.540.000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pagado</span>
                        <span className="font-semibold text-emerald-400">
                          76%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Departamentos morosos</span>
                        <span className="font-semibold text-rose-400">
                          12
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs font-semibold text-slate-200">
                      Panel propietario (vista ejemplo)
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-100">
                            Dpto. 304 · Torre A
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Estado: al día
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
                          Pagado
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-t border-slate-800 pt-2">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Último pago
                          </p>
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
                Comunidad Organizada nace desde la práctica: panel para
                administradores, panel para propietarios y herramientas hechas
                para el día a día de los condominios en Chile.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                title="Panel administrador"
                description="Controla condominios, edificios, departamentos, gastos comunes y pagos desde un panel simple y ordenado."
                items={[
                  "Multi-condominio y multi-edificio",
                  "Historial de gastos e ingresos",
                  "Control de morosidad en tiempo real",
                ]}
              />
              <FeatureCard
                title="Panel propietarios"
                description="Cada propietario puede ver su estado de cuenta, pagos realizados y descargar sus comprobantes."
                items={[
                  "Acceso con usuario y contraseña",
                  "Transparencia en gastos",
                  "Menos llamadas y correos al administrador",
                ]}
              />
              <FeatureCard
                title="Reportes y documentación"
                description="Genera documentos claros para reuniones y directorios sin perder tiempo en Excel."
                items={[
                  "Gastos comunes en PDF",
                  "Reportes por periodo",
                  "Exportación para respaldo contable",
                ]}
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-b border-slate-800 bg-slate-950/90"
        >
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
                Cómo funciona
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                En pocos pasos puedes tener tu comunidad completamente cargada y
                operando en la plataforma.
              </p>
            </div>

            <ol className="grid gap-6 md:grid-cols-3">
              <StepCard
                number="1"
                title="Configura tu condominio"
                description="Crea tu condominio, edificios y departamentos. Define metrajes, coeficientes o la lógica que usas para prorratear los gastos."
              />
              <StepCard
                number="2"
                title="Carga gastos y genera cobros"
                description="Registra los gastos del periodo (agua, luz, aseo, mantenciones) y genera automáticamente los cobros de gastos comunes."
              />
              <StepCard
                number="3"
                title="Comparte acceso y controla pagos"
                description="Los propietarios ingresan a su panel, descargan sus documentos y tú registras los pagos, controlando morosidad al instante."
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
                  Parte con un plan simple y escala cuando tu cartera de
                  condominios crezca. Sin costos ocultos, sin letra chica.
                </p>
              </div>
              <p className="text-xs text-slate-400">
                *Valores y límites referenciales. Puedes ajustarlos cuando
                definamos los planes definitivos.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <PriceCard
                name="Trial"
                highlight={false}
                description="Prueba gratis todas las funciones básicas por un tiempo limitado."
                price="$0"
                period="por 14 días"
                items={[
                  "1 condominio",
                  "Hasta 10 departamentos",
                  "Panel administrador",
                ]}
              />
              <PriceCard
                name="Básico"
                highlight
                description="Para un condominio o edificio que quiere ordenar sus gastos comunes."
                price="$19.990"
                period="mensual"
                items={[
                  "1 condominio",
                  "Hasta 40 departamentos",
                  "Reportes en PDF",
                  "Soporte por WhatsApp",
                ]}
              />
              <PriceCard
                name="Avanzado"
                highlight={false}
                description="Para administradores con varias comunidades y acceso para propietarios."
                price="$34.990"
                period="mensual"
                items={[
                  "Hasta 3 condominios",
                  "Panel propietarios",
                  "Control de morosidad",
                  "Reportes avanzados",
                ]}
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
                  Si eres administrador o miembro de comité y quieres ver cómo
                  funcionaría Comunidad Organizada en tu condominio, déjanos tus
                  datos y coordinamos una demo.
                </p>
                <div className="mt-6 space-y-2 text-sm text-slate-300">
                  <p>📍 Chile</p>
                  <p>📧 contacto@mambadigital.cl</p>
                  <p>📱 +56 9 94833280</p>
                </div>
              </div>

              <form className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Nombre y apellido
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Correo electrónico
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                    placeholder="tucorreo@ejemplo.cl"
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
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      N° de departamentos aprox.
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring"
                      placeholder="Ej: 80"
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
                  />
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Enviar y solicitar demo
                </button>
                <p className="text-[11px] text-slate-400">
                  Al enviar aceptas ser contactado sólo para coordinar una demo
                  o entregarte información del sistema. Nada de spam.
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
            <button className="hover:text-emerald-400">
              Términos y condiciones
            </button>
            <button className="hover:text-emerald-400">Política de datos</button>
          </div>
        </div>
      </footer>
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
};

function PriceCard({
  name,
  description,
  price,
  period,
  items,
  highlight,
}: PriceCardProps) {
  return (
    <div
      className={[
        "flex flex-col rounded-2xl border bg-slate-900/70 p-4",
        highlight
          ? "border-emerald-500/70 shadow-lg shadow-emerald-500/30"
          : "border-slate-800",
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

      <button className="mt-5 w-full rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-emerald-500 hover:text-emerald-300">
        Quiero este plan
      </button>
    </div>
  );
}
