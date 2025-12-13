// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Gastos from "../pages/Gastos";
import Ingresos from "../pages/Ingresos";
import Departamentos from "../pages/Departamentos";
import Edificios from "../pages/Edificios";
import Balance from "../pages/Balance";
import Condominios from "../pages/Condominios";
import Estacionamientos from "../pages/Estacionamientos";
import Perfil from "../pages/Perfil";
import Configuracion from "../pages/Configuracion";
import GastosComunes from "../pages/GastosComunes";
import MisGastosComunes from "../pages/owner/MisGastosComunes";

import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";

// 🔹 NUEVAS páginas para propietarios
import MiPanel from "../pages/owner/MiPanel";
import MisPagos from "../pages/owner/MisPagos";
import LandingPage from "../pages/landing";
import PlanVencido from "../pages/PlanVencido";
// Puedes crear luego MisGastosComunes si quieres algo más detallado

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (sin token) */}
        <Route path="/login" element={<Login />} />
        <Route path="/index" element={<LandingPage />} />
        <Route path="/plan-vencido" element={<PlanVencido />} />


        {/* RUTAS ADMIN */}
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingresos"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Ingresos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gastos"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Gastos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gastosComunes"
          element={
            <ProtectedRoute roles={["admin"]}>
              <GastosComunes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departamentos"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Departamentos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edificios"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Edificios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/condominios"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Condominios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estacionamientos"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Estacionamientos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/balance"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Balance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute roles={["admin", "owner"]}>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracion"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Configuracion />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROPIETARIO */}
        <Route
          path="/mi-panel"
          element={
            <ProtectedRoute roles={["owner"]}>
              <MiPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-pagos"
          element={
            <ProtectedRoute roles={["owner"]}>
              <MisPagos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-gastos-comunes"
          element={
            <ProtectedRoute roles={["owner"]}>
              <MisGastosComunes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
