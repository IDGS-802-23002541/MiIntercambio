import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Typography } from "@mui/material";
import { IconoArbol } from "../components/Iconos";
import { useAuth } from "../context/AuthContext";
import { obtenerIntercambiosPublicos } from "../services/intercambiosService";

const formatearFecha = fecha => {
  if (!fecha) return "Sin fecha";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export default function ListaIntercambios() {
  const navigate = useNavigate();
  const { iniciarSesionConGoogle } = useAuth();
  const [intercambios, setIntercambios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await obtenerIntercambiosPublicos();
        setIntercambios(datos);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar los intercambios.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleGoogle = async () => {
    setError("");
    try {
      await iniciarSesionConGoogle();
    } catch (error) {
      console.error(error);
      if (error.code === "auth/unauthorized-domain") {
        setError("Este dominio no está autorizado en Firebase Authentication.");
      } else if (error.code === "auth/operation-not-allowed") {
        setError("El acceso con Google no está habilitado en Firebase.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Cerraste la ventana de Google.");
      } else {
        setError("No fue posible iniciar sesión como administrador.");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <Box sx={{
        background: "linear-gradient(135deg, #8e0000 0%, #b71c1c 45%, #d4af37 100%)",
        color: "#fff",
        px: 3,
        py: 6,
        textAlign: "center"
      }}>
        <IconoArbol size={56} />
        <Typography variant="h4" sx={{ mt: 1 }}>
          Intercambios familiares
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
          Elige el intercambio en el que participas para entrar.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", px: 3, mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : intercambios.length === 0 ? (
          <Paper elevation={3} sx={{ p: 5, textAlign: "center", borderTop: 6, borderColor: "primary.main" }}>
            <Typography variant="h5" gutterBottom>
              Todavía no hay intercambios abiertos
            </Typography>
            <Typography color="text.secondary">
              Cuando el administrador abra uno, aparecerá aquí.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 3
          }}>
            {intercambios.map(intercambio => (
              <Paper
                key={intercambio.id}
                elevation={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderTop: 6,
                  borderColor: intercambio.estado === "sorteado" ? "secondary.main" : "primary.main"
                }}
              >
                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                    <Typography variant="h6" fontWeight={700}>
                      {intercambio.nombre}
                    </Typography>
                    <Chip
                      size="small"
                      label={intercambio.estado === "sorteado" ? "sorteado" : "abierto"}
                      color={intercambio.estado === "sorteado" ? "secondary" : "primary"}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Presupuesto: ${intercambio.presupuesto} {intercambio.moneda}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Evento: {formatearFecha(intercambio.fechaEvento)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participantes: {intercambio.participantes?.length || 0}
                  </Typography>
                </Box>
                <Box sx={{ px: 3, pb: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/intercambio/${intercambio.id}`)}
                  >
                    Entrar
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="text"
            color="secondary"
            size="small"
            onClick={handleGoogle}
          >
            Acceso administrador con Google
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
