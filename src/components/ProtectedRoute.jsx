import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ rol }) {
  const { usuario, perfil, cargando } = useAuth();

  if (cargando) {
    return <p>Comprobando sesión...</p>;
  }

  if (!usuario || !perfil) {
    return <Navigate to="/" replace />;
  }

  if (rol && perfil.rol !== rol) {
    return (
      <Navigate to={perfil.rol === "admin" ? "/admin/intercambios" : "/familiar"} replace/>
    );
  }
  return <Outlet />;
}
