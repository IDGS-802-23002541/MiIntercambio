import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const mapear = documento => ({
    id: documento.id,
    ...documento.data()
});

export const obtenerCategorias = async () => {
    const consulta = await getDocs(collection(db, "categorias"));
    return consulta.docs
        .map(mapear)
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
};

export const obtenerCategoriasActivas = async () => {
    const categorias = await obtenerCategorias();
    return categorias.filter(categoria => categoria.activo);
};

export const crearCategoria = async (datos) => {
    const referencia = await addDoc(collection(db, "categorias"), {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        activo: true,
        orden: Number(datos.orden)
    });
    return referencia.id;
};

export const actualizarCategoria = async (id, datos) => {
    await updateDoc(doc(db, "categorias", id), {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        orden: Number(datos.orden)
    });
};

export const cambiarEstadoCategoria = async (id, activo) => {
    await updateDoc(doc(db, "categorias", id), { activo });
};
