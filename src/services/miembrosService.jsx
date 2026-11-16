import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { collection, getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { firebaseConfig, db } from "../firebase/config";

const nombreApp = "MiIntercambioDos";

const appSecundaria = getApps().find(
    app => app.name === nombreApp
) || initializeApp(firebaseConfig, nombreApp);

const authSecundario = getAuth(appSecundaria);

export const obtenerMiembros = async () => {
    const consulta = await getDocs(collection(db, "miembros"));
    return consulta.docs
        .map(documento => ({
            uid: documento.id,
            ...documento.data()
        }))
        .filter(miembro => miembro.rol === "familiar")
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

export const registrarMiembro = async (nombre, fechaNacimiento) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento || "")) {
        throw new Error("FECHA_INVALIDA");
    }
    const correo = `miembro-${crypto.randomUUID()}@miintercambio.app`;
    const [anio, mes, dia] = fechaNacimiento.split("-");
    const password = `${dia}${mes}${anio.slice(-2)}`;
    let nuevoUsuario = null;
    try {
        const credencial = await createUserWithEmailAndPassword(
            authSecundario,
            correo,
            password
        );
        nuevoUsuario = credencial.user;
        const batch = writeBatch(db);
        const miembroRef = doc(db, "miembros", nuevoUsuario.uid);
        const directorioRef = doc(db, "directorio", nuevoUsuario.uid);

        batch.set(miembroRef, {
            nombre,
            correo,
            rol: "familiar",
            estado: "activo",
            fechaRegistro: serverTimestamp()
        });
        batch.set(directorioRef, {
            nombre,
            correo,
            estado: "activo"
        });
        await batch.commit();
        return {
            uid: nuevoUsuario.uid,
            nombre,
            correo,
            password,
        };
    } catch (error) {
        if (nuevoUsuario) {
            try {
                await deleteUser(nuevoUsuario);
            } catch (errorEliminacion) {
                console.error("No se pudo revertir la cuenta:", errorEliminacion);
            }
        }
        throw error;
    } finally {
        try {
            await signOut(authSecundario);
        } catch (errorSalida) {
            console.error("No se pudo cerrar la sesión secundaria:", errorSalida);
        }
    }
};

export const actualizarMiembro = async (uid, datos) => {
    const batch = writeBatch(db);
    batch.update(doc(db, "miembros", uid), {
        nombre: datos.nombre,
        estado: datos.estado
    });
    batch.update(doc(db, "directorio", uid), {
        nombre: datos.nombre,
        estado: datos.estado
    });
    await batch.commit();
};
