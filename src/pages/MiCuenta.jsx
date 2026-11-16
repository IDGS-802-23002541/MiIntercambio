import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { IconoLlave } from "../components/Iconos";
import { useAuth } from "../context/AuthContext";
import { cambiarPassword } from "../services/cuentaService";

const mensajeError = error => {
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        return "Tu contraseña actual no es correcta.";
    }
    if (error.code === "auth/weak-password") {
        return "La nueva contraseña debe tener al menos 6 caracteres.";
    }
    if (error.code === "auth/requires-recent-login") {
        return "Cierra sesión, vuelve a entrar y repite el cambio.";
    }
    if (error.code === "auth/network-request-failed") {
        return "Sin conexión. Revisa tu internet.";
    }
    return "No se pudo cambiar la contraseña. Intenta nuevamente.";
};

export default function MiCuenta() {
    const { perfil } = useAuth();
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [confirmacion, setConfirmacion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    const cambiar = async (e) => {
        e.preventDefault();
        setError("");
        setExito("");
        if (nueva.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (nueva !== confirmacion) {
            setError("La confirmación no coincide con la nueva contraseña.");
            return;
        }
        try {
            setGuardando(true);
            await cambiarPassword(actual, nueva);
            setExito("Tu contraseña se actualizó correctamente.");
            setActual("");
            setNueva("");
            setConfirmacion("");
        } catch (error) {
            console.error(error);
            setError(mensajeError(error));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconoLlave size={32} />
                <Typography variant="h4">
                    Mi cuenta
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {perfil?.nombre}
            </Typography>

            <Paper elevation={3} sx={{ p: 3, maxWidth: 520, borderTop: 6, borderColor: "secondary.main" }}>
                {perfil?.rol === "admin" ? (
                    <Alert severity="info">
                        Tu cuenta entra con Google, así que la contraseña se administra desde tu cuenta de Google.
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={cambiar}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Cambiar tu contraseña es opcional. Puedes seguir usando tu cumpleaños si lo prefieres.
                        </Typography>
                        <TextField
                            fullWidth
                            type="password"
                            label="Contraseña actual"
                            value={actual}
                            onChange={e => setActual(e.target.value)}
                            margin="normal"
                            disabled={guardando}
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Nueva contraseña"
                            value={nueva}
                            onChange={e => setNueva(e.target.value)}
                            margin="normal"
                            helperText="Mínimo 6 caracteres."
                            disabled={guardando}
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirmar nueva contraseña"
                            value={confirmacion}
                            onChange={e => setConfirmacion(e.target.value)}
                            margin="normal"
                            disabled={guardando}
                            required
                        />
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {exito && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {exito}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3 }}
                            disabled={guardando}
                        >
                            {guardando ? "Guardando..." : "Cambiar contraseña"}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
