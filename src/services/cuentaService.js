import { initializeApp, getApps } from "firebase/app";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, signInWithEmailAndPassword, signOut,
updatePassword } from "firebase/auth";
import { auth, firebaseConfig } from "../firebase/config";

const nombreApp = "MiIntercambioVerificacion";

const appVerificacion = getApps().find(
    app => app.name === nombreApp
) || initializeApp(firebaseConfig, nombreApp);

const authVerificacion = getAuth(appVerificacion);

export const verificarPassword = async (correo, password) => {
    const credencial = await signInWithEmailAndPassword(authVerificacion, correo, password);
    const uid = credencial.user.uid;
    await signOut(authVerificacion);
    return uid;
};

export const cambiarPassword = async (passwordActual, passwordNueva) => {
    const credencial = EmailAuthProvider.credential(auth.currentUser.email, passwordActual);
    await reauthenticateWithCredential(auth.currentUser, credencial);
    await updatePassword(auth.currentUser, passwordNueva);
};
