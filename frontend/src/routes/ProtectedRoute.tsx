// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated, User } from "../services/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<"admin" | "owner">; // opcional: ['admin'] o ['owner']
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();

  if (!loggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se pasan roles permitidos, revisamos
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === "owner" ? "/mi-panel" : "/";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
