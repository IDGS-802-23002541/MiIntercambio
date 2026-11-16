import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ListaIntercambios from "./pages/ListaIntercambios";
import LoginIntercambio from "./pages/LoginIntercambio";
import DashboardFamiliar from "./pages/DashFamiliar";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Miembros from "./pages/Miembros";
import AdminIntercambios from "./pages/AdminIntercambios";
import Categorias from "./pages/Categorias";
import Sugerencias from "./pages/Sugerencias";
import MiAsignacion from "./pages/MiAsignacion";
import MiCuenta from "./pages/MiCuenta";

function PublicRoute() {
    const { usuario, perfil, cargando } = useAuth();
    if (cargando) return <p>Comprobando sesión...</p>;
    if (usuario && perfil) {
        return (
            <Navigate to={perfil.rol === "admin" ? "/admin/intercambios" : "/familiar"} replace />
        );
    }
    return <Outlet />;
}

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/",
                element: <ListaIntercambios />
            },
            {
                path: "/intercambio/:id",
                element: <LoginIntercambio />
            }
        ]
    },
    {
        element: <ProtectedRoute rol="admin" />,
        children: [
            {
                path: "/admin",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/admin/intercambios" replace />
                    },
                    {
                        path: "miembros",
                        element: <Miembros />
                    },
                    {
                        path: "intercambios",
                        element: <AdminIntercambios />
                    },
                    {
                        path: "categorias",
                        element: <Categorias />
                    },
                    {
                        path: "sugerencias",
                        element: <Sugerencias />
                    },
                    {
                        path: "mi-asignacion",
                        element: <MiAsignacion />
                    }
                ]
            }
        ]
    },
    {
        element: <ProtectedRoute rol="familiar" />,
        children: [
            {
                path: "/familiar",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardFamiliar />
                    },
                    {
                        path: "sugerencias",
                        element: <Sugerencias />
                    },
                    {
                        path: "mi-asignacion",
                        element: <MiAsignacion />
                    },
                    {
                        path: "mi-cuenta",
                        element: <MiCuenta />
                    }
                ]
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

export default router;
