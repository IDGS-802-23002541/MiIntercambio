import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { IconoArbol } from "../components/Iconos";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { perfil, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const esAdmin = perfil?.rol === "admin";

  const enlaces = esAdmin
    ? [
      { ruta: "/admin/intercambios", texto: "Intercambios" },
      { ruta: "/admin/miembros", texto: "Miembros" },
      { ruta: "/admin/categorias", texto: "Categorías" },
      { ruta: "/admin/sugerencias", texto: "Sugerencias" },
      { ruta: "/admin/mi-asignacion", texto: "Mi asignación" }
    ]
    : [
      { ruta: "/familiar", texto: "Inicio" },
      { ruta: "/familiar/sugerencias", texto: "Sugerencias" },
      { ruta: "/familiar/mi-asignacion", texto: "Mi asignación" },
      { ruta: "/familiar/mi-cuenta", texto: "Mi cuenta" }
    ];

  const handleLogout = async () => {
    await cerrarSesion();
    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={4}
        sx={{ background: "linear-gradient(135deg, #8e0000 0%, #b71c1c 60%, #a67c00 100%)" }}
      >
        <Toolbar sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
            <IconoArbol size={26} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MiIntercambio
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flexGrow: 1 }}>
            {enlaces.map(enlace => (
              <Button
                key={enlace.ruta}
                color="inherit"
                size="small"
                onClick={() => navigate(enlace.ruta)}
                sx={{
                  borderBottom: location.pathname === enlace.ruta ? "2px solid #d4af37" : "2px solid transparent",
                  borderRadius: 0
                }}
              >
                {enlace.texto}
              </Button>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {perfil?.nombre}
          </Typography>
          <Button color="inherit" size="small" variant="outlined" onClick={handleLogout} sx={{ borderColor: "#d4af37" }}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
