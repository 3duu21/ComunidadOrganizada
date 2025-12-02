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

import Login from "../pages/Login";             // ⬅️ nueva página
import ProtectedRoute from "./ProtectedRoute";  // ⬅️ nuevo componente

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (sin token) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas (requieren token en localStorage) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingresos"
          element={
            <ProtectedRoute>
              <Ingresos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gastos"
          element={
            <ProtectedRoute>
              <Gastos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departamentos"
          element={
            <ProtectedRoute>
              <Departamentos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edificios"
          element={
            <ProtectedRoute>
              <Edificios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/condominios"
          element={
            <ProtectedRoute>
              <Condominios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estacionamientos"
          element={
            <ProtectedRoute>
              <Estacionamientos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/balance"
          element={
            <ProtectedRoute>
              <Balance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <Configuracion />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
