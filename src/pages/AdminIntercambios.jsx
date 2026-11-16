import { useEffect, useState } from "react";
import { Alert, Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { IconoIntercambio } from "../components/Iconos";
import { useAuth } from "../context/AuthContext";
import { obtenerMiembros } from "../services/miembrosService";
import { actualizarIntercambio, cambiarEstado, crearIntercambio, eliminarIntercambio,
obtenerIntercambios } from "../services/intercambiosService";
import { sortearIntercambio } from "../services/sorteoService";

const crearFormularioVacio = () => ({
    nombre: "",
    presupuesto: "",
    moneda: "MXN",
    fechaEvento: "",
    fechaSorteo: "",
    fechaLimite: "",
    participantes: [],
    reglas: ["Respetar el presupuesto", "No revelar el destinatario"]
});

const coloresEstado = {
    configuracion: "default",
    abierto: "primary",
    sorteado: "secondary",
    finalizado: "info",
    cancelado: "error"
};

const formatearFecha = fecha => {
    if (!fecha) return "Sin fecha";
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const mensajeError = error => {
    if (error.code === "permission-denied") {
        return "No tienes permisos para modificar intercambios.";
    }
    if (error.code === "auth/network-request-failed") {
        return "Sin conexión. Revisa tu internet.";
    }
    return "No se pudo guardar el intercambio. Intenta nuevamente.";
};

export default function AdminIntercambios() {
    const { perfil } = useAuth();
    const [intercambios, setIntercambios] = useState([]);
    const [miembros, setMiembros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(crearFormularioVacio());
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [errorModal, setErrorModal] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargar = async () => {
        try {
            setCargando(true);
            const [datosIntercambios, datosMiembros] = await Promise.all([
                obtenerIntercambios(),
                obtenerMiembros()
            ]);
            setIntercambios(datosIntercambios);
            setMiembros(datosMiembros);
        } catch (error) {
            console.error(error);
            setError("No se pudieron cargar los intercambios.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const opciones = [
        ...(perfil ? [{ uid: perfil.uid, nombre: `${perfil.nombre} (administrador)`, activo: true }] : []),
        ...miembros.map(miembro => ({
            uid: miembro.uid,
            nombre: miembro.nombre,
            activo: miembro.estado === "activo"
        }))
    ].filter(opcion => opcion.activo || formulario.participantes.includes(opcion.uid));

    const cambiarCampo = (campo, valor) => {
        setFormulario(actual => ({ ...actual, [campo]: valor }));
    };

    const abrirFormulario = (intercambio = null) => {
        setEditando(intercambio);
        setFormulario(intercambio
            ? {
                nombre: intercambio.nombre,
                presupuesto: String(intercambio.presupuesto ?? ""),
                moneda: intercambio.moneda || "MXN",
                fechaEvento: intercambio.fechaEvento || "",
                fechaSorteo: intercambio.fechaSorteo || "",
                fechaLimite: intercambio.fechaLimite || "",
                participantes: intercambio.participantes || [],
                reglas: intercambio.reglas || []
            }
            : crearFormularioVacio());
        setErrorModal("");
        setModalAbierto(true);
    };

    const guardar = async () => {
        const reglas = formulario.reglas.map(regla => regla.trim()).filter(Boolean);
        if (!formulario.nombre.trim()) {
            setErrorModal("El nombre es obligatorio.");
            return;
        }
        if (!formulario.presupuesto || Number(formulario.presupuesto) <= 0) {
            setErrorModal("El presupuesto debe ser mayor a cero.");
            return;
        }
        if (!formulario.fechaEvento || !formulario.fechaSorteo || !formulario.fechaLimite) {
            setErrorModal("Completa las tres fechas del intercambio.");
            return;
        }
        if (formulario.participantes.length < 2) {
            setErrorModal("Selecciona al menos dos participantes.");
            return;
        }
        const datos = {
            nombre: formulario.nombre.trim(),
            presupuesto: formulario.presupuesto,
            moneda: formulario.moneda,
            fechaEvento: formulario.fechaEvento,
            fechaSorteo: formulario.fechaSorteo,
            fechaLimite: formulario.fechaLimite,
            participantes: formulario.participantes,
            reglas
        };
        try {
            setErrorModal("");
            setGuardando(true);
            if (editando) {
                await actualizarIntercambio(editando.id, datos);
            } else {
                await crearIntercambio(datos);
            }
            setModalAbierto(false);
            setEditando(null);
            await cargar();
        } catch (error) {
            console.error(error);
            setErrorModal(mensajeError(error));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoIntercambio = async (intercambio, estado) => {
        if (estado === "abierto" && (intercambio.participantes?.length || 0) < 2) {
            setError("Agrega al menos dos participantes antes de abrir el intercambio.");
            return;
        }
        try {
            setError("");
            await cambiarEstado(intercambio.id, estado);
            await cargar();
        } catch (error) {
            console.error(error);
            setError(mensajeError(error));
        }
    };

    const sortear = async (intercambio) => {
        const total = intercambio.participantes?.length || 0;
        if (!window.confirm(`Se asignará un destinatario a cada uno de los ${total} participantes. El sorteo no se puede repetir. ¿Continuar?`)) {
            return;
        }
        try {
            setError("");
            setMensaje("");
            const asignaciones = await sortearIntercambio(intercambio);
            setMensaje(`Sorteo realizado: ${asignaciones} asignaciones creadas. Cada familiar ya puede consultar la suya.`);
            await cargar();
        } catch (error) {
            console.error(error);
            if (error.message === "ESTADO_INVALIDO") {
                setError("Solo se puede sortear un intercambio que esté abierto.");
            } else if (error.message === "POCOS_PARTICIPANTES") {
                setError("El intercambio necesita al menos dos participantes.");
            } else if (error.message === "SORTEO_FALLIDO") {
                setError("No se pudo generar un sorteo válido. Intenta de nuevo.");
            } else if (error.code === "permission-denied") {
                setError("No tienes permisos para realizar el sorteo.");
            } else {
                setError("No se pudo realizar el sorteo. Intenta nuevamente.");
            }
        }
    };

    const borrar = async (intercambio) => {        if (!window.confirm(`¿Eliminar el intercambio "${intercambio.nombre}"?`)) {
            return;
        }
        try {
            setError("");
            await eliminarIntercambio(intercambio.id);
            await cargar();
        } catch (error) {
            console.error(error);
            setError(mensajeError(error));
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
                        <IconoIntercambio size={32} />
                        <Typography variant="h4">
                            Intercambios
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Familia Tapia Ibarra
                    </Typography>
                </Box>
                <Button variant="contained" onClick={() => abrirFormulario()}>
                    Nuevo intercambio
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {mensaje && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje("")}>
                    {mensaje}
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
                            <TableCell>Intercambio</TableCell>
                            <TableCell>Presupuesto</TableCell>
                            <TableCell>Participantes</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    Cargando intercambios...
                                </TableCell>
                            </TableRow>
                        ) : intercambios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    No hay intercambios registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            intercambios.map(intercambio => (
                                <TableRow key={intercambio.id} hover>
                                    <TableCell>
                                        <Typography fontWeight={600}>
                                            {intercambio.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Evento: {formatearFecha(intercambio.fechaEvento)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        ${intercambio.presupuesto} {intercambio.moneda}
                                    </TableCell>
                                    <TableCell>
                                        {intercambio.participantes?.length || 0}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={intercambio.estado}
                                            color={coloresEstado[intercambio.estado] || "default"}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "flex-end" }}>
                                            {(intercambio.estado === "configuracion" || intercambio.estado === "abierto") && (
                                                <Button size="small" onClick={() => abrirFormulario(intercambio)}>
                                                    Editar
                                                </Button>
                                            )}
                                            {intercambio.estado === "configuracion" && (
                                                <Button size="small" color="success" onClick={() => cambiarEstadoIntercambio(intercambio, "abierto")}>
                                                    Abrir
                                                </Button>
                                            )}
                                            {intercambio.estado === "abierto" && (
                                                <Button size="small" color="secondary" variant="contained" onClick={() => sortear(intercambio)}>
                                                    Sortear
                                                </Button>
                                            )}
                                            {intercambio.estado === "abierto" && (
                                                <Button size="small" color="error" onClick={() => cambiarEstadoIntercambio(intercambio, "cancelado")}>
                                                    Cancelar
                                                </Button>
                                            )}
                                            {(intercambio.estado === "abierto" || intercambio.estado === "sorteado") && (
                                                <Button size="small" onClick={() => cambiarEstadoIntercambio(intercambio, "finalizado")}>
                                                    Finalizar
                                                </Button>
                                            )}
                                            {(intercambio.estado === "configuracion" || intercambio.estado === "cancelado") && (
                                                <Button size="small" color="error" onClick={() => borrar(intercambio)}>
                                                    Eliminar
                                                </Button>
                                            )}
                                        </Box>
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
                maxWidth="sm"
            >
                <DialogTitle>
                    {editando ? "Editar intercambio" : "Nuevo intercambio"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre del intercambio"
                        value={formulario.nombre}
                        onChange={e => cambiarCampo("nombre", e.target.value)}
                        margin="normal"
                        disabled={guardando}
                    />

                    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
                        <TextField
                            type="number"
                            label="Presupuesto"
                            value={formulario.presupuesto}
                            onChange={e => cambiarCampo("presupuesto", e.target.value)}
                            margin="normal"
                            disabled={guardando}
                        />
                        <TextField
                            select
                            label="Moneda"
                            value={formulario.moneda}
                            onChange={e => cambiarCampo("moneda", e.target.value)}
                            margin="normal"
                            disabled={guardando}
                        >
                            <MenuItem value="MXN">MXN</MenuItem>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                        </TextField>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            type="date"
                            label="Fecha del evento"
                            value={formulario.fechaEvento}
                            onChange={e => cambiarCampo("fechaEvento", e.target.value)}
                            margin="normal"
                            slotProps={{ inputLabel: { shrink: true } }}
                            disabled={guardando}
                        />
                        <TextField
                            type="date"
                            label="Fecha del sorteo"
                            value={formulario.fechaSorteo}
                            onChange={e => cambiarCampo("fechaSorteo", e.target.value)}
                            margin="normal"
                            slotProps={{ inputLabel: { shrink: true } }}
                            disabled={guardando}
                        />
                        <TextField
                            type="date"
                            label="Límite de sugerencias"
                            value={formulario.fechaLimite}
                            onChange={e => cambiarCampo("fechaLimite", e.target.value)}
                            margin="normal"
                            slotProps={{ inputLabel: { shrink: true } }}
                            disabled={guardando}
                        />
                    </Box>

                    <Autocomplete
                        multiple
                        options={opciones}
                        getOptionLabel={opcion => opcion.nombre}
                        isOptionEqualToValue={(opcion, valor) => opcion.uid === valor.uid}
                        value={opciones.filter(opcion => formulario.participantes.includes(opcion.uid))}
                        onChange={(evento, valores) => cambiarCampo("participantes", valores.map(valor => valor.uid))}
                        disabled={guardando}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Participantes"
                                margin="normal"
                                placeholder="Elige a los familiares"
                            />
                        )}
                    />

                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Reglas del intercambio
                    </Typography>
                    {formulario.reglas.map((regla, indice) => (
                        <Box key={indice} sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={regla}
                                onChange={e => {
                                    const nuevas = [...formulario.reglas];
                                    nuevas[indice] = e.target.value;
                                    cambiarCampo("reglas", nuevas);
                                }}
                                disabled={guardando}
                            />
                            <Button
                                size="small"
                                color="error"
                                onClick={() => cambiarCampo("reglas", formulario.reglas.filter((_, i) => i !== indice))}
                                disabled={guardando}
                            >
                                Quitar
                            </Button>
                        </Box>
                    ))}
                    <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => cambiarCampo("reglas", [...formulario.reglas, ""])}
                        disabled={guardando}
                    >
                        Agregar regla
                    </Button>

                    {errorModal && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errorModal}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalAbierto(false)} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={guardar} disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
