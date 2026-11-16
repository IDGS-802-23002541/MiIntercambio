import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody,
TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { IconoGrupo } from "../components/Iconos";
import { obtenerMiembros, registrarMiembro, actualizarMiembro } from "../services/miembrosService";

const mensajeError = error => {
    if (error.message === "FECHA_INVALIDA") {
        return "La fecha de nacimiento es obligatoria para generar la contraseña inicial.";
    }
    switch (error.code) {
        case "permission-denied":
            return "No tienes permisos para registrar familiares.";
        case "auth/email-already-in-use":
            return "Ese acceso ya existe. Intenta nuevamente.";
        case "auth/weak-password":
            return "La contraseña generada no es válida. Revisa la fecha.";
        case "auth/network-request-failed":
            return "Sin conexión. Revisa tu internet.";
        default:
            return "No se pudo guardar el familiar. Intenta nuevamente.";
    }
};

export default function Miembros() {
    const [miembros, setMiembros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [miembroEditar, setMiembroEditar] = useState(null);
    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [error, setError] = useState("");
    const [credenciales, setCredenciales] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const cargarMiembros = async () => {
        try {
            setCargando(true);
            const datos = await obtenerMiembros();
            setMiembros(datos);
        } catch (error) {
            console.error(error);
            setError("No se pudieron cargar los familiares.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarMiembros();
    }, []);

    const abrirFormulario = (miembro = null) => {
        setMiembroEditar(miembro);
        setNombre(miembro?.nombre || "");
        setFechaNacimiento("");
        setError("");
        setModalAbierto(true);
    };

    const guardarMiembro = async () => {
        if (!nombre.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        if (!miembroEditar && !fechaNacimiento) {
            setError("Selecciona la fecha de nacimiento para generar la contraseña inicial.");
            return;
        }
        try {
            setError("");
            setGuardando(true);
            if (miembroEditar) {
                await actualizarMiembro(
                    miembroEditar.uid,
                    { nombre: nombre.trim(), estado: miembroEditar.estado }
                );
            } else {
                const nuevoMiembro = await registrarMiembro(nombre.trim(), fechaNacimiento);
                setCredenciales(nuevoMiembro);
            }
            setModalAbierto(false);
            setNombre("");
            setFechaNacimiento("");
            setMiembroEditar(null);
            await cargarMiembros();
        } catch (error) {
            console.error(error);
            setError(mensajeError(error));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (miembro) => {
        const nuevoEstado =
            miembro.estado === "activo" ? "inactivo" : "activo";
        try {
            await actualizarMiembro(miembro.uid, {
                nombre: miembro.nombre,
                estado: nuevoEstado
            });
            await cargarMiembros();
        } catch (error) {
            console.error(error);
            setError("No se pudo actualizar el estado.");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 3
            }}>
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconoGrupo size={32} />
                        <Typography variant="h4">
                            Miembros
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Familia Tapia Ibarra
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => abrirFormulario()}
                >
                    Agregar familiar
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {credenciales && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setCredenciales(null)}
                >
                    <Typography fontWeight="bold">
                        ¡Familiar registrado!
                    </Typography>
                    <Typography>
                        Nombre: {credenciales.nombre}
                    </Typography>
                    <Typography>
                        Contraseña inicial: {credenciales.password}
                    </Typography>
                    <Typography variant="caption">
                        Compártela una sola vez. Después no se puede consultar.
                    </Typography>
                </Alert>
            )}

            <TableContainer
                component={Paper}
                elevation={3}
                sx={{ borderTop: 6, borderColor: "primary.main" }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    Cargando familiares...
                                </TableCell>
                            </TableRow>
                        ) : miembros.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    No hay familiares registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            miembros.map(miembro => (
                                <TableRow key={miembro.uid} hover>
                                    <TableCell>
                                        {miembro.nombre}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={miembro.estado}
                                            color={
                                                miembro.estado === "activo"
                                                    ? "success"
                                                    : "default"
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            onClick={() => abrirFormulario(miembro)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="small"
                                            color={
                                                miembro.estado === "activo"
                                                    ? "error"
                                                    : "success"
                                            }
                                            onClick={() => cambiarEstado(miembro)}
                                        >
                                            {miembro.estado === "activo"
                                                ? "Desactivar"
                                                : "Activar"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {miembroEditar ? "Editar familiar" : "Registrar familiar"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre completo"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        margin="normal"
                        disabled={guardando}
                    />
                    {!miembroEditar && (
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de nacimiento"
                            value={fechaNacimiento}
                            onChange={e => setFechaNacimiento(e.target.value)}
                            margin="normal"
                            slotProps={{ inputLabel: { shrink: true } }}
                            helperText="Se usa solo para la contraseña inicial (DDMMAA)."
                            disabled={guardando}
                            required
                        />
                    )}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setModalAbierto(false)}
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={guardarMiembro}
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
