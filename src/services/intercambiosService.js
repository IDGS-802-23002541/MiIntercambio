import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const ordenarPorEvento = (a, b) => (a.fechaEvento || "").localeCompare(b.fechaEvento || "");

const mapear = documento => ({
    id: documento.id,
    ...documento.data()
});

export const obtenerIntercambiosPublicos = async () => {
    const consulta = await getDocs(collection(db, "intercambios"));
    return consulta.docs
        .map(mapear)
        .filter(intercambio => intercambio.estado === "abierto" || intercambio.estado === "sorteado")
        .sort(ordenarPorEvento);
};

export const obtenerIntercambios = async () => {
    const consulta = await getDocs(collection(db, "intercambios"));
    return consulta.docs
        .map(mapear)
        .sort(ordenarPorEvento);
};

export const obtenerIntercambio = async (id) => {
    const resultado = await getDoc(doc(db, "intercambios", id));
    return resultado.exists() ? { id: resultado.id, ...resultado.data() } : null;
};

export const crearIntercambio = async (datos) => {
    const referencia = await addDoc(collection(db, "intercambios"), {
        nombre: datos.nombre,
        presupuesto: Number(datos.presupuesto),
        moneda: datos.moneda,
        fechaEvento: datos.fechaEvento,
        fechaSorteo: datos.fechaSorteo,
        fechaLimite: datos.fechaLimite,
        estado: "configuracion",
        participantes: datos.participantes,
        reglas: datos.reglas,
        fechaCreacion: serverTimestamp()
    });
    return referencia.id;
};

export const actualizarIntercambio = async (id, datos) => {
    await updateDoc(doc(db, "intercambios", id), {
        nombre: datos.nombre,
        presupuesto: Number(datos.presupuesto),
        moneda: datos.moneda,
        fechaEvento: datos.fechaEvento,
        fechaSorteo: datos.fechaSorteo,
        fechaLimite: datos.fechaLimite,
        participantes: datos.participantes,
        reglas: datos.reglas
    });
};

export const cambiarEstado = async (id, estado) => {
    await updateDoc(doc(db, "intercambios", id), { estado });
};

export const eliminarIntercambio = async (id) => {
    await deleteDoc(doc(db, "intercambios", id));
};
