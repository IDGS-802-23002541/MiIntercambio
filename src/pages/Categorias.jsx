import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody,
TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { IconoEtiqueta } from "../components/Iconos";
import { actualizarCategoria, cambiarEstadoCategoria, crearCategoria, obtenerCategorias } from "../services/categoriasService";

const crearFormularioVacio = () => ({
    nombre: "",
    descripcion: "",
    orden: ""
});

const mensajeError = error => {
    if (error.code === "permission-denied") {
        return "No tienes permisos para modificar categorías.";
    }
    if (error.code === "auth/network-request-failed") {
        return "Sin conexión. Revisa tu internet.";
    }
    return "No se pudo guardar la categoría. Intenta nuevamente.";
};

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(crearFormularioVacio());
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [errorModal, setErrorModal] = useState("");

    const cargar = async () => {
        try {
            setCargando(true);
            const datos = await obtenerCategorias();
            setCategorias(datos);
        } catch (error) {
            console.error(error);
            setError("No se pudieron cargar las categorías.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const abrirFormulario = (categoria = null) => {
        setEditando(categoria);
        setFormulario(categoria
            ? {
                nombre: categoria.nombre || "",
                descripcion: categoria.descripcion || "",
                orden: String(categoria.orden ?? "")
            }
            : crearFormularioVacio());
        setErrorModal("");
        setModalAbierto(true);
    };

    const guardar = async () => {
        if (!formulario.nombre.trim()) {
            setErrorModal("El nombre es obligatorio.");
            return;
        }
        const datos = {
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            orden: formulario.orden === "" ? 0 : formulario.orden
        };
        try {
            setErrorModal("");
            setGuardando(true);
            if (editando) {
                await actualizarCategoria(editando.id, datos);
            } else {
                await crearCategoria(datos);
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

    const cambiarEstado = async (categoria) => {
        try {
            setError("");
            await cambiarEstadoCategoria(categoria.id, !categoria.activo);
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
                        <IconoEtiqueta size={32} />
                        <Typography variant="h4">
                            Categorías
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Se usan, si quieres, al registrar sugerencias.
                    </Typography>
                </Box>
                <Button variant="contained" onClick={() => abrirFormulario()}>
                    Nueva categoría
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <TableContainer
                component={Paper}
                elevation={3}
                sx={{ borderTop: 6, borderColor: "secondary.main" }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Orden</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    Cargando categorías...
                                </TableCell>
                            </TableRow>
                        ) : categorias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    No hay categorías registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categorias.map(categoria => (
                                <TableRow key={categoria.id} hover>
                                    <TableCell>
                                        {categoria.orden ?? 0}
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>
                                            {categoria.nombre}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {categoria.descripcion || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={categoria.activo ? "activa" : "inactiva"}
                                            color={categoria.activo ? "success" : "default"}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => abrirFormulario(categoria)}>
                                            Editar
                                        </Button>
                                        <Button
                                            size="small"
                                            color={categoria.activo ? "error" : "success"}
                                            onClick={() => cambiarEstado(categoria)}
                                        >
                                            {categoria.activo ? "Desactivar" : "Activar"}
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
                    {editando ? "Editar categoría" : "Nueva categoría"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={formulario.nombre}
                        onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={formulario.descripcion}
                        onChange={e => setFormulario({ ...formulario, descripcion: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Orden"
                        helperText="Número menor aparece primero."
                        value={formulario.orden}
                        onChange={e => setFormulario({ ...formulario, orden: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
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
