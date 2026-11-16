import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(
      auth, async (usuarioFirebase) => {
        if (!usuarioFirebase) {
          setUsuario(null);
          setPerfil(null);
          setCargando(false);
          return;
        }

        try {
          const referencia = doc(db, "miembros", usuarioFirebase.uid);
          const resultado = await getDoc(referencia);
          let datosPerfil;

          if (resultado.exists()) {
            datosPerfil = resultado.data();
          } else {
            datosPerfil = {
              nombre: usuarioFirebase.displayName || "Administrador",
              correo: usuarioFirebase.email,
              rol: "admin",
              estado: "activo",
              fechaRegistro: serverTimestamp()
            };
            await setDoc(referencia, datosPerfil);
          }

          if (datosPerfil.estado !== "activo") {
            await signOut(auth);
            setUsuario(null);
            setPerfil(null);
            return;
          }

          setUsuario(usuarioFirebase);
          setPerfil({ uid: usuarioFirebase.uid, ...datosPerfil });

          if (datosPerfil.rol === "admin") {
            try {
              await setDoc(doc(db, "directorio", usuarioFirebase.uid), {
                nombre: datosPerfil.nombre,
                correo: datosPerfil.correo || usuarioFirebase.email,
                estado: datosPerfil.estado,
                esAdmin: true
              }, { merge: true });
            } catch (errorDirectorio) {
              console.error("No se pudo sincronizar el directorio del admin:", errorDirectorio);
            }
          }
        } catch (error) {
          console.error("Error al consultar el perfil:", error);
          await signOut(auth);
          setUsuario(null);
          setPerfil(null);
        } finally {
          setCargando(false);
        }
      }
    );
    return () => cancelarSuscripcion();
  }, []);

  const iniciarSesion = async (correo, password) => {
    const credencial = await signInWithEmailAndPassword(
      auth,
      correo,
      password
    );
    return credencial.user;
  };

  const iniciarSesionConGoogle = async () => {
    const proveedor = new GoogleAuthProvider();
    const credencial = await signInWithPopup(auth, proveedor);
    return credencial.user;
  };

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando, iniciarSesion, iniciarSesionConGoogle, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}
