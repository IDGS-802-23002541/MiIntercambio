import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Link, MenuItem,
Paper, TextField, Typography } from "@mui/material";
import { IconoFoco } from "../components/Iconos";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { obtenerIntercambios } from "../services/intercambiosService";
import { obtenerCategoriasActivas } from "../services/categoriasService";
import { actualizarSugerencia, crearSugerencia, eliminarSugerencia, obtenerSugerencias } from "../services/sugerenciasService";

const crearFormularioVacio = () => ({
    titulo: "",
    enlace: "",
    descripcion: "",
    categoriaId: ""
});

const mensajeError = error => {
    if (error.code === "permission-denied") {
        return "No tienes permisos para modificar esta sugerencia.";
    }
    if (error.code === "auth/network-request-failed") {
        return "Sin conexión. Revisa tu internet.";
    }
    return "No se pudo guardar la sugerencia. Intenta nuevamente.";
};

const inicialDe = nombre => (nombre || "?").trim().charAt(0).toUpperCase();

export default function Sugerencias() {
    const { perfil } = useAuth();
    const [intercambios, setIntercambios] = useState([]);
    const [intercambioId, setIntercambioId] = useState("");
    const [sugerencias, setSugerencias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [nombres, setNombres] = useState({});
    const [filtroMiembro, setFiltroMiembro] = useState("");
    const [cargando, setCargando] = useState(true);
    const [cargandoLista, setCargandoLista] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formulario, setFormulario] = useState(crearFormularioVacio());
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [errorModal, setErrorModal] = useState("");

    useEffect(() => {
        const cargar = async () => {
            if (!perfil?.uid) return;
            try {
                setCargando(true);
                const [todos, categoriasData, directorio] = await Promise.all([
                    obtenerIntercambios(),
                    obtenerCategoriasActivas(),
                    getDocs(collection(db, "directorio"))
                ]);
                const disponibles = todos.filter(intercambio =>
                    (intercambio.estado === "abierto" || intercambio.estado === "sorteado")
                    && intercambio.participantes?.includes(perfil.uid)
                );
                setIntercambios(disponibles);
                setCategorias(categoriasData);
                setNombres(Object.fromEntries(directorio.docs.map(documento => [documento.id, documento.data().nombre])));
                setIntercambioId(actual => actual || disponibles[0]?.id || "");
            } catch (error) {
                console.error(error);
                setError("No se pudieron cargar tus intercambios.");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [perfil?.uid]);

    useEffect(() => {
        const cargarLista = async () => {
            if (!intercambioId) {
                setSugerencias([]);
                return;
            }
            try {
                setCargandoLista(true);
                const datos = await obtenerSugerencias(intercambioId);
                setSugerencias(datos);
            } catch (error) {
                console.error(error);
                setError("No se pudieron cargar las sugerencias.");
            } finally {
                setCargandoLista(false);
            }
        };
        cargarLista();
        setFiltroMiembro("");
    }, [intercambioId]);

    const intercambioActual = intercambios.find(intercambio => intercambio.id === intercambioId);
    const hoy = new Date().toISOString().slice(0, 10);
    const eventoPasado = Boolean(intercambioActual?.fechaEvento) && hoy > intercambioActual.fechaEvento;
    const puedeCrear = Boolean(intercambioActual) && !eventoPasado;

    const nombreDe = miembroUid => {
        if (miembroUid === perfil?.uid) return perfil?.nombre || "Tú";
        return nombres[miembroUid] || "Familiar";
    };

    const nombreCategoria = categoriaId => {
        if (!categoriaId) return null;
        return categorias.find(categoria => categoria.id === categoriaId)?.nombre || null;
    };

    const participantes = (intercambioActual?.participantes || []).map(uid => ({
        uid,
        nombre: nombreDe(uid)
    }));

    const sugerenciasVisibles = filtroMiembro
        ? sugerencias.filter(sugerencia => sugerencia.miembroUid === filtroMiembro)
        : sugerencias;

    const abrirFormulario = (sugerencia = null) => {
        setEditando(sugerencia);
        setFormulario(sugerencia
            ? {
                titulo: sugerencia.titulo || "",
                enlace: sugerencia.enlace || "",
                descripcion: sugerencia.descripcion || "",
                categoriaId: sugerencia.categoriaId || ""
            }
            : crearFormularioVacio());
        setErrorModal("");
        setModalAbierto(true);
    };

    const guardar = async () => {
        if (!formulario.titulo.trim()) {
            setErrorModal("El título del regalo es obligatorio.");
            return;
        }
        if (!intercambioActual) {
            setErrorModal("Selecciona un intercambio.");
            return;
        }
        const datos = {
            intercambioId: intercambioActual.id,
            miembroUid: perfil.uid,
            titulo: formulario.titulo.trim(),
            enlace: formulario.enlace.trim(),
            descripcion: formulario.descripcion.trim(),
            categoriaId: formulario.categoriaId || null
        };
        try {
            setErrorModal("");
            setGuardando(true);
            if (editando) {
                await actualizarSugerencia(editando.id, datos);
            } else {
                await crearSugerencia(datos);
            }
            setModalAbierto(false);
            setEditando(null);
            const datosActualizados = await obtenerSugerencias(intercambioActual.id);
            setSugerencias(datosActualizados);
        } catch (error) {
            console.error(error);
            setErrorModal(mensajeError(error));
        } finally {
            setGuardando(false);
        }
    };

    const borrar = async (sugerencia) => {
        if (!window.confirm(`¿Eliminar la sugerencia "${sugerencia.titulo}"?`)) {
            return;
        }
        try {
            setError("");
            await eliminarSugerencia(sugerencia.id);
            const datosActualizados = await obtenerSugerencias(intercambioId);
            setSugerencias(datosActualizados);
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
                        <IconoFoco size={32} />
                        <Typography variant="h4">
                            Sugerencias
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Comparte ideas de regalos con la familia.
                    </Typography>
                </Box>
                {puedeCrear && (
                    <Button variant="contained" onClick={() => abrirFormulario()}>
                        Nueva sugerencia
                    </Button>
                )}
            </Box>

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
                        Aún no participas en un intercambio abierto
                    </Typography>
                    <Typography color="text.secondary">
                        Cuando el administrador te agregue, aparecerá aquí.
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                        <TextField
                            select
                            size="small"
                            label="Intercambio"
                            value={intercambioId}
                            onChange={e => setIntercambioId(e.target.value)}
                            sx={{ minWidth: 240 }}
                        >
                            {intercambios.map(intercambio => (
                                <MenuItem key={intercambio.id} value={intercambio.id}>
                                    {intercambio.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            size="small"
                            label="Filtrar por familiar"
                            value={filtroMiembro}
                            onChange={e => setFiltroMiembro(e.target.value)}
                            sx={{ minWidth: 240 }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {participantes.map(participante => (
                                <MenuItem key={participante.uid} value={participante.uid}>
                                    {participante.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {!puedeCrear && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            La fecha del evento ya pasó, así que las sugerencias están cerradas. Todavía puedes consultarlas.
                        </Alert>
                    )}

                    {cargandoLista ? (
                        <Typography>Cargando sugerencias...</Typography>
                    ) : sugerenciasVisibles.length === 0 ? (
                        <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderTop: 6, borderColor: "secondary.main" }}>
                            <Typography variant="h6" gutterBottom>
                                {filtroMiembro ? "Este familiar no ha agregado sugerencias" : "Todavía no hay sugerencias"}
                            </Typography>
                            <Typography color="text.secondary">
                                {puedeCrear
                                    ? "Sé el primero en compartir una idea de regalo."
                                    : "Las sugerencias aparecerán aquí cuando se registren."}
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                            gap: 3
                        }}>
                            {sugerenciasVisibles.map(sugerencia => {
                                const esMia = sugerencia.miembroUid === perfil?.uid;
                                const categoria = nombreCategoria(sugerencia.categoriaId);
                                return (
                                    <Paper
                                        key={sugerencia.id}
                                        elevation={4}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            p: 2.5,
                                            gap: 1.5,
                                            borderTop: 6,
                                            borderColor: esMia ? "secondary.main" : "primary.main"
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar sx={{
                                                bgcolor: esMia ? "secondary.main" : "primary.main",
                                                color: "#fff",
                                                fontWeight: 700
                                            }}>
                                                {inicialDe(nombreDe(sugerencia.miembroUid))}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                                    {nombreDe(sugerencia.miembroUid)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {esMia ? "Tu sugerencia" : "Sugerencia de regalo"}
                                                </Typography>
                                            </Box>
                                            {esMia && (
                                                <Chip size="small" color="secondary" label="Mía" />
                                            )}
                                        </Box>

                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>
                                                {sugerencia.titulo}
                                            </Typography>
                                            {sugerencia.descripcion && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {sugerencia.descripcion}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ mt: "auto", display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                                            {categoria ? (
                                                <Chip size="small" variant="outlined" color="secondary" label={categoria} />
                                            ) : (
                                                <Chip size="small" variant="outlined" label="Sin categoría" />
                                            )}
                                            {sugerencia.enlace && (
                                                <Link href={sugerencia.enlace} target="_blank" rel="noopener noreferrer" variant="body2">
                                                    Ver regalo
                                                </Link>
                                            )}
                                        </Box>

                                        {esMia && (
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <Button size="small" variant="outlined" onClick={() => abrirFormulario(sugerencia)}>
                                                    Editar
                                                </Button>
                                                <Button size="small" color="error" onClick={() => borrar(sugerencia)}>
                                                    Eliminar
                                                </Button>
                                            </Box>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Box>
                    )}
                </>
            )}

            <Dialog
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {editando ? "Editar sugerencia" : "Nueva sugerencia"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Título del regalo"
                        value={formulario.titulo}
                        onChange={e => setFormulario({ ...formulario, titulo: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        fullWidth
                        label="Enlace (opcional)"
                        placeholder="https://..."
                        value={formulario.enlace}
                        onChange={e => setFormulario({ ...formulario, enlace: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Descripción (opcional)"
                        value={formulario.descripcion}
                        onChange={e => setFormulario({ ...formulario, descripcion: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Categoría (opcional)"
                        value={formulario.categoriaId}
                        onChange={e => setFormulario({ ...formulario, categoriaId: e.target.value })}
                        margin="normal"
                        disabled={guardando}
                    >
                        <MenuItem value="">Sin categoría</MenuItem>
                        {categorias.map(categoria => (
                            <MenuItem key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </MenuItem>
                        ))}
                    </TextField>
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
