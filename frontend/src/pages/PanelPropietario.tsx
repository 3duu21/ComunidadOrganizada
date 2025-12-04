// src/pages/PanelPropietario.tsx
import Sidebar from "../components/Sidebar";

export default function PanelPropietario() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Mi panel de propietario
        </h2>
        <p className="text-sm text-gray-600">
          Aquí luego mostraremos tus departamentos, gastos comunes y pagos
          asociados solo a ti.
        </p>
      </main>
    </div>
  );
}
