# MiIntercambio
*Aideé Vanessa Casillas Tapia*\
***IDGS1002 - Aplicaciones Web Progresivas***

Aplicación web para organizar el intercambio de regalos de la familia. Permite registrar familiares, crear intercambios, guardar sugerencias de regalos, administrar categorías y realizar el sorteo.

Hecha con React + Vite, Material UI y Firebase (Authentication, Firestore y Hosting). Funciona con el plan gratuito Spark.

## Roles

- **Administrador:** entra con su cuenta de Google. Administra miembros, intercambios, categorías y sugerencias, y ejecuta el sorteo.
- **Familiar:** no se registra. El administrador le crea la cuenta y entra eligiendo su nombre y su contraseña inicial, que es su cumpleaños en formato `DDMMAA`.

## Requisitos

- Node.js 18 o superior
- npm
- Un proyecto de Firebase con Authentication (Email/Password y Google) y Firestore habilitados

## Cómo correr el proyecto

1. Instala las dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto con las credenciales de tu app web de Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

3. Levanta el servidor de desarrollo:

```bash
npm run dev
```

Abre la dirección que muestra la terminal, normalmente `http://localhost:5173`.

## Otros comandos

```bash
npm run build
npm run preview
```

## Despliegue

La aplicación está preparada para Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Estructura

```text
src/
├── components/     Rutas protegidas e íconos
├── context/        Sesión y perfil del usuario
├── firebase/       Configuración de Firebase
├── layouts/        Barra de navegación y contenedor
├── pages/          Pantallas de la aplicación
├── services/       Operaciones con Firestore y Authentication
├── router.jsx      Definición de rutas
├── App.jsx
└── main.jsx
```
