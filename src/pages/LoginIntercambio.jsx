import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { IconoArbol } from "../components/Iconos";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { obtenerIntercambio } from "../services/intercambiosService";

const mensajeError = error => {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "La contraseña no es correcta. Recuerda que la inicial es tu cumpleaños DDMMAA.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisa tu internet.";
    default:
      return "No fue posible iniciar sesión. Intenta nuevamente.";
  }
};

const formatearFecha = fecha => {
  if (!fecha) return "Sin fecha";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export default function LoginIntercambio() {
  const { id } = useParams();
  const { iniciarSesion } = useAuth();
  const [intercambio, setIntercambio] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await obtenerIntercambio(id);
        if (!datos) {
          setError("Este intercambio no existe.");
          return;
        }
        if (datos.estado !== "abierto" && datos.estado !== "sorteado") {
          setError("Este intercambio no está disponible por ahora.");
          return;
        }
        setIntercambio(datos);
        const consulta = await getDocs(collection(db, "directorio"));
        const participantes = consulta.docs
          .map(documento => ({
            uid: documento.id,
            ...documento.data()
          }))
          .filter(miembro => miembro.estado === "activo" && !miembro.esAdmin)
          .filter(miembro => datos.participantes?.includes(miembro.uid))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setMiembros(participantes);
      } catch (error) {
        console.error(error);
        setError("No se pudo cargar el intercambio.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const miembro = miembros.find(m => m.uid === miembroSeleccionado);
    if (!miembro) {
      setError("Selecciona tu nombre.");
      return;
    }
    try {
      setEnviando(true);
      await iniciarSesion(miembro.correo, contrasenia);
    } catch (error) {
      console.error(error);
      setError(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
      py: 4
    }}>
      <Paper
        elevation={8}
        sx={{ width: "100%", maxWidth: 460, overflow: "hidden" }}
      >
        <Box sx={{
          background: "linear-gradient(135deg, #8e0000 0%, #b71c1c 45%, #d4af37 100%)",
          color: "#fff",
          px: 4,
          py: 4,
          textAlign: "center"
        }}>
          <IconoArbol size={48} />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            {intercambio?.nombre || "Intercambio familiar"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            {intercambio
              ? `Evento: ${formatearFecha(intercambio.fechaEvento)}`
              : "Cargando información..."}
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {cargando ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !intercambio ? (
            <>
              <Alert severity="warning">{error}</Alert>
              <Button component={Link} to="/" fullWidth sx={{ mt: 3 }}>
                Volver a los intercambios
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ¡Bienvenido! Selecciona tu nombre para continuar.
              </Typography>
              <TextField
                select
                fullWidth
                label="¿Quién eres?"
                value={miembroSeleccionado}
                onChange={e => setMiembroSeleccionado(e.target.value)}
                margin="normal"
                disabled={enviando}
              >
                {miembros.map(miembro => (
                  <MenuItem key={miembro.uid} value={miembro.uid}>
                    {miembro.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                placeholder="Tu cumpleaños: DDMMAA"
                value={contrasenia}
                onChange={e => setContrasenia(e.target.value)}
                margin="normal"
                disabled={enviando}
                required
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={enviando}
                sx={{ mt: 3 }}
              >
                Entrar al intercambio
              </Button>
              <Button component={Link} to="/" fullWidth size="small" sx={{ mt: 1 }}>
                Ver otros intercambios
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
