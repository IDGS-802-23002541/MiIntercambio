import { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Paper,
TextField, Typography } from "@mui/material";
import { IconoRegalo, IconoEstrella } from "../components/Iconos";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { obtenerIntercambios } from "../services/intercambiosService";
import { obtenerAsignacionesDe } from "../services/sorteoService";
import { obtenerSugerencias } from "../services/sugerenciasService";
import { verificarPassword } from "../services/cuentaService";

const formatearFecha = fecha => {
    if (!fecha) return "Sin fecha";
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const mensajeError = error => {
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        return "La contraseña no es correcta.";
    }
    if (error.code === "auth/too-many-requests") {
        return "Demasiados intentos. Espera unos minutos.";
    }
    if (error.code === "permission-denied") {
        return "No puedes consultar esta asignación.";
    }
    return "No se pudo verificar tu contraseña. Intenta nuevamente.";
};

export default function MiAsignacion() {
    const { perfil } = useAuth();
    const [intercambios, setIntercambios] = useState([]);
    const [asignaciones, setAsignaciones] = useState({});
    const [nombres, setNombres] = useState({});
    const [intercambioId, setIntercambioId] = useState("");
    const [detalle, setDetalle] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [contrasenia, setContrasenia] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            if (!perfil?.uid) return;
            try {
                setCargando(true);
                const [todos, misAsignaciones, directorio] = await Promise.all([
                    obtenerIntercambios(),
                    obtenerAsignacionesDe(perfil.uid),
                    getDocs(collection(db, "directorio"))
                ]);
                const sorteados = todos.filter(intercambio =>
                    (intercambio.estado === "sorteado" || intercambio.estado === "finalizado")
                    && intercambio.participantes?.includes(perfil.uid)
                );
                setIntercambios(sorteados);
                setAsignaciones(Object.fromEntries(
                    misAsignaciones.map(asignacion => [asignacion.intercambioId, asignacion])
                ));
                setNombres(Object.fromEntries(
                    directorio.docs.map(documento => [documento.id, documento.data().nombre])
                ));
                setIntercambioId(sorteados[0]?.id || "");
            } catch (error) {
                console.error(error);
                setError("No se pudo cargar tu asignación.");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [perfil?.uid]);

    useEffect(() => {
        setDetalle(null);
        setContrasenia("");
    }, [intercambioId]);

    const intercambioActual = intercambios.find(intercambio => intercambio.id === intercambioId);
    const asignacionActual = asignaciones[intercambioId];

    const revelar = async () => {
        if (!asignacionActual) return;
        try {
            setError("");
            setVerificando(true);
            if (perfil.rol !== "admin") {
                await verificarPassword(perfil.correo, contrasenia);
            }
            const sugerenciasIntercambio = await obtenerSugerencias(intercambioActual.id);
            setDetalle({
                nombre: nombres[asignacionActual.destinatarioUid] || "Familiar",
                sugerencias: sugerenciasIntercambio.filter(
                    sugerencia => sugerencia.miembroUid === asignacionActual.destinatarioUid
                )
            });
            setModalAbierto(false);
            setContrasenia("");
        } catch (error) {
            console.error(error);
            setError(mensajeError(error));
        } finally {
            setVerificando(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconoRegalo size={32} />
                <Typography variant="h4">
                    Mi asignación
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tu resultado del sorteo. Nadie más puede verlo desde su cuenta.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {cargando ? (
                <Typography>Cargando...</Typography>
            ) : intercambios.length === 0 ? (
                <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderTop: 6, borderColor: "primary.main" }}>
                    <Typography variant="h6" gutterBottom>
                        Todavía no hay sorteo
                    </Typography>
                    <Typography color="text.secondary">
                        Cuando el administrador realice el sorteo, aquí verás a quién te toca.
                    </Typography>
                </Paper>
            ) : (
                <>
                    {intercambios.length > 1 && (
                        <TextField
                            select
                            size="small"
                            label="Intercambio"
                            value={intercambioId}
                            onChange={e => setIntercambioId(e.target.value)}
                            sx={{ minWidth: 260, mb: 3 }}
                        >
                            {intercambios.map(intercambio => (
                                <MenuItem key={intercambio.id} value={intercambio.id}>
                                    {intercambio.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Paper
                        elevation={4}
                        sx={{ p: 4, borderTop: 6, borderColor: "secondary.main", maxWidth: 620 }}
                    >
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {intercambioActual?.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Evento: {formatearFecha(intercambioActual?.fechaEvento)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Presupuesto: ${intercambioActual?.presupuesto} {intercambioActual?.moneda}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        {!asignacionActual ? (
                            <Alert severity="info">
                                El sorteo de este intercambio todavía no se ha realizado.
                            </Alert>
                        ) : detalle ? (
                            <>
                                <Typography variant="overline" color="text.secondary">
                                    Te toca regalarle a
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                                    <IconoEstrella size={36} />
                                    <Typography variant="h4" fontWeight={700} color="primary.main">
                                        {detalle.nombre}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Revisa sus sugerencias antes de comprar.
                                </Typography>
                                {detalle.sugerencias.length > 0 && (
                                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                                        {detalle.sugerencias.map(sugerencia => (
                                            <Paper key={sugerencia.id} variant="outlined" sx={{ p: 1.5 }}>
                                                <Typography fontWeight={600}>
                                                    {sugerencia.titulo}
                                                </Typography>
                                                {sugerencia.descripcion && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {sugerencia.descripcion}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        ))}
                                    </Box>
                                )}
                                {detalle.sugerencias.length === 0 && (
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Todavía no registró sugerencias.
                                    </Typography>
                                )}
                                <Button sx={{ mt: 3 }} onClick={() => setDetalle(null)}>
                                    Ocultar resultado
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    El resultado está oculto. Confirma tu identidad para verlo.
                                </Typography>
                                <Button variant="contained" onClick={() => setModalAbierto(true)}>
                                    Ver mi asignación
                                </Button>
                            </>
                        )}
                    </Paper>
                </>
            )}

            <Dialog
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {perfil?.rol === "admin" ? "Confirmar" : "Confirma tu contraseña"}
                </DialogTitle>
                <DialogContent>
                    {perfil?.rol === "admin" ? (
                        <Typography variant="body2">
                            Tu cuenta usa Google, así que no se pide contraseña. Solo tú puedes ver esta asignación.
                        </Typography>
                    ) : (
                        <TextField
                            fullWidth
                            type="password"
                            label="Contraseña"
                            value={contrasenia}
                            onChange={e => setContrasenia(e.target.value)}
                            margin="normal"
                            disabled={verificando}
                        />
                    )}
                    {error && modalAbierto && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalAbierto(false)} disabled={verificando}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={revelar} disabled={verificando}>
                        {verificando ? "Verificando..." : "Ver resultado"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
