import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

const mezclar = arreglo => {
    const copia = [...arreglo];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

const generarPermutacion = participantes => {
    for (let intento = 0; intento < 200; intento++) {
        const mezclados = mezclar(participantes);
        if (mezclados.every((uid, indice) => uid !== participantes[indice])) {
            return mezclados;
        }
    }
    throw new Error("SORTEO_FALLIDO");
};

export const sortearIntercambio = async (intercambio) => {
    if (intercambio.estado !== "abierto") {
        throw new Error("ESTADO_INVALIDO");
    }
    if (!intercambio.participantes || intercambio.participantes.length < 2) {
        throw new Error("POCOS_PARTICIPANTES");
    }
    const destinatarios = generarPermutacion(intercambio.participantes);
    const batch = writeBatch(db);
    intercambio.participantes.forEach((participanteUid, indice) => {
        batch.set(doc(db, "asignaciones", `${intercambio.id}_${participanteUid}`), {
            intercambioId: intercambio.id,
            participanteUid,
            destinatarioUid: destinatarios[indice],
            fechaAsignacion: serverTimestamp()
        });
    });
    batch.update(doc(db, "intercambios", intercambio.id), { estado: "sorteado" });
    await batch.commit();
    return destinatarios.length;
};

export const obtenerAsignacionesDe = async (participanteUid) => {
    const consulta = await getDocs(
        query(collection(db, "asignaciones"), where("participanteUid", "==", participanteUid))
    );
    return consulta.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
    }));
};
