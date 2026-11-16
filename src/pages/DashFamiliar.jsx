import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, Paper, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { obtenerIntercambios } from "../services/intercambiosService";

const formatearFecha = fecha => {
  if (!fecha) return "Sin fecha";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const estados = {
  abierto: { etiqueta: "Abierto", color: "primary" },
  sorteado: { etiqueta: "Sorteado", color: "secondary" },
  finalizado: { etiqueta: "Finalizado", color: "default" }
};

export default function DashboardFamiliar() {
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const [intercambios, setIntercambios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      if (!perfil?.uid) return;
      try {
        const todos = await obtenerIntercambios();
        setIntercambios(todos.filter(intercambio =>
          (intercambio.estado === "abierto" || intercambio.estado === "sorteado" || intercambio.estado === "finalizado")
          && intercambio.participantes?.includes(perfil.uid)
        ));
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar tus intercambios.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [perfil?.uid]);

  return (
    <Box>
      <Typography variant="h4">
        ¡Hola, {perfil?.nombre}!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Este es tu espacio para el intercambio familiar.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {cargando ? (
        <Typography>Cargando...</Typography>
      ) : intercambios.length === 0 ? (
        <Paper elevation={3} sx={{ p: 5, textAlign: "center", borderTop: 6, borderColor: "primary.main" }}>
          <Typography variant="h5" gutterBottom>
            Aún no participas en un intercambio
          </Typography>
          <Typography color="text.secondary">
            Cuando el administrador te agregue, aparecerá aquí.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {intercambios.map(intercambio => {
            const estado = estados[intercambio.estado] || { etiqueta: intercambio.estado, color: "default" };
            const puedeVerAsignacion = intercambio.estado === "sorteado" || intercambio.estado === "finalizado";
            return (
              <Paper
                key={intercambio.id}
                elevation={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                  borderTop: 6,
                  borderColor: puedeVerAsignacion ? "secondary.main" : "primary.main"
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {intercambio.nombre}
                  </Typography>
                  <Chip size="small" label={estado.etiqueta} color={estado.color} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Evento: {formatearFecha(intercambio.fechaEvento)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Presupuesto: ${intercambio.presupuesto} {intercambio.moneda}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Límite de sugerencias: {formatearFecha(intercambio.fechaLimite)}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => navigate("/familiar/sugerencias")}>
                    Ver sugerencias
                  </Button>
                  {puedeVerAsignacion && (
                    <Button size="small" variant="contained" onClick={() => navigate("/familiar/mi-asignacion")}>
                      Ver mi asignación
                    </Button>
                  )}
                </Box>

                {intercambio.reglas?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reglas del intercambio
                    </Typography>
                    {intercambio.reglas.map((regla, indice) => (
                      <Typography key={indice} variant="body2">
                        • {regla}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
