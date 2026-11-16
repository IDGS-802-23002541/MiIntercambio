import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/config";

const mapear = documento => ({
    id: documento.id,
    ...documento.data()
});

export const obtenerSugerencias = async (intercambioId) => {
    const consulta = await getDocs(
        query(collection(db, "sugerencias"), where("intercambioId", "==", intercambioId))
    );
    return consulta.docs
        .map(mapear)
        .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
};

export const crearSugerencia = async (datos) => {
    const referencia = await addDoc(collection(db, "sugerencias"), {
        intercambioId: datos.intercambioId,
        miembroUid: datos.miembroUid,
        titulo: datos.titulo,
        enlace: datos.enlace,
        descripcion: datos.descripcion,
        categoriaId: datos.categoriaId,
        fechaCreacion: serverTimestamp()
    });
    return referencia.id;
};

export const actualizarSugerencia = async (id, datos) => {
    await updateDoc(doc(db, "sugerencias", id), {
        titulo: datos.titulo,
        enlace: datos.enlace,
        descripcion: datos.descripcion,
        categoriaId: datos.categoriaId
    });
};

export const eliminarSugerencia = async (id) => {
    await deleteDoc(doc(db, "sugerencias", id));
};
