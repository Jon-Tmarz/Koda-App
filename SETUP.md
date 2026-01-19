# 🚀 Guía de Configuración e Inicio - Portal KODA

## ✅ Pasos Completados

Se ha creado exitosamente el portal administrativo KODA con todas las funcionalidades solicitadas:

### 📦 Estructura Implementada

1. ✅ **ThemeProvider** - Modo Light/Dark con next-themes
2. ✅ **Componentes UI** - Button, Card, Table, Dialog, Input (shadcn/ui)
3. ✅ **Sidebar Colapsable** - Navegación con iconos de Lucide React
4. ✅ **Firebase Auth** - Sistema de login y protección de rutas
5. ✅ **Dashboard Principal** - Cards de estadísticas y gráfico de actividad
6. ✅ **Gestión de Servicios** - CRUD completo con Firestore
7. ✅ **Gestión de Leads** - CRUD con estados y filtros
8. ✅ **Cotizaciones** - Listado e historial
9. ✅ **Configuración** - Ajustes globales del sistema

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

**📍 Dónde obtener estas credenciales:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a: Configuración del proyecto (⚙️) → General
4. Desplázate hasta "Tus apps" → SDK Setup and Configuration
5. Copia los valores de `firebaseConfig`

### 2. Configurar Firebase Authentication

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Get Started**
3. Habilita **Email/Password** como método de acceso
4. Crea tu primer usuario:
   - Ve a la pestaña **Users**
   - Haz clic en **Add User**
   - Ingresa email y contraseña
   - Guarda las credenciales para hacer login

### 3. Configurar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Create Database**
3. Selecciona **Start in test mode** (temporal)
4. Elige tu región (ej: us-central1)
5. Haz clic en **Enable**

**Colecciones a crear:**

Las colecciones se crearán automáticamente al agregar el primer documento desde la app. Sin embargo, puedes pre-crearlas:

- `servicios` - Para gestionar servicios tecnológicos
- `leads` - Para clientes potenciales
- `cotizaciones` - Para historial de cotizaciones
- `configuracion` - Con documento `global` para ajustes del sistema

**Reglas de Seguridad Recomendadas:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🎯 Iniciar la Aplicación

### 1. Instalar dependencias (si no se ha hecho)

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### 3. Primer Login

1. Abre **http://localhost:3000**
2. Serás redirigido automáticamente a `/login`
3. Ingresa las credenciales del usuario creado en Firebase
4. Serás redirigido al dashboard

---

## 📱 Estructura de Navegación

```
/                        → Redirige a /login
/login                   → Pantalla de autenticación
/dashboard               → Dashboard principal con estadísticas
/dashboard/overview      → Vista general (igual al dashboard)
/dashboard/services      → CRUD de servicios (WordPress, Node.js, etc.)
/dashboard/leads         → Gestión de clientes potenciales
/dashboard/quotes        → Historial de cotizaciones
/dashboard/setup         → Configuración global (moneda, IVA, empresa)
```

---

## 🎨 Temas y Personalización

### Cambiar entre Light/Dark Mode

- Usa el botón **Sol/Luna** en la barra superior derecha
- El tema se guardará en localStorage
- Por defecto inicia en **Dark Mode**

### Colores Personalizados

Los colores se definen en [src/app/globals.css](src/app/globals.css):

**Modo Oscuro:**
- Fondo: `#0a0a0a` (casi negro)
- Bordes sutiles con transparencia
- Glassmorphism en las cards

**Modo Claro:**
- Fondo: Blanco puro
- Sombras suaves
- Alto contraste para legibilidad

---

## 📊 Uso de las Funcionalidades

### 1. Gestión de Servicios

**Crear un servicio:**
1. Ve a **Dashboard → Services**
2. Haz clic en **Nuevo Servicio**
3. Completa el formulario:
   - Nombre: Ej. "Desarrollo WordPress"
   - Categoría: Ej. "Desarrollo Web"
   - Tecnologías: Ej. "WordPress, PHP, MySQL" (separadas por comas)
   - Precio: Monto numérico
   - Descripción: (Opcional)
4. Haz clic en **Crear**

**Editar/Eliminar:**
- Usa los iconos de lápiz ✏️ y papelera 🗑️ en cada fila

### 2. Gestión de Leads

**Crear un lead:**
1. Ve a **Dashboard → Leads**
2. Haz clic en **Nuevo Lead**
3. Completa la información del cliente
4. Selecciona el estado: Nuevo / En proceso / Finalizado
5. Guarda

**Estados disponibles:**
- 🔵 Nuevo - Cliente recién contactado
- 🟡 En proceso - Negociación activa
- 🟢 Finalizado - Cliente cerrado o descartado

### 3. Cotizaciones

Esta sección muestra el historial de cotizaciones generadas.
Los datos se sincronizan automáticamente con Firestore.

### 4. Configuración Global

**Ajustar configuración:**
1. Ve a **Dashboard → Setup**
2. Modifica:
   - Nombre de la empresa
   - Moneda (USD, MXN, EUR)
   - IVA (porcentaje)
   - URL del logo
3. Haz clic en **Guardar Configuración**

---

## 🔒 Seguridad

### Protección de Rutas

Todas las rutas bajo `/dashboard/*` están protegidas por autenticación:
- Si no hay usuario logueado → Redirige a `/login`
- Si hay sesión activa → Permite el acceso

### Cerrar Sesión

Para cerrar sesión, puedes agregar un botón de logout en el sidebar o crear una función que ejecute:

```typescript
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const handleLogout = async () => {
  await signOut(auth);
  router.push("/login");
};
```

---

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - Ve a: Settings → Environment Variables
   - Agrega todas las variables `NEXT_PUBLIC_FIREBASE_*`
3. Despliega automáticamente con cada push a `main`

### Otras Plataformas

```bash
npm run build
npm start
```

---

## 📚 Tecnologías Utilizadas

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **Firebase** - Backend (Auth + Firestore)
- **shadcn/ui** - Componentes accesibles
- **Lucide React** - Iconografía moderna
- **Recharts** - Gráficos interactivos
- **next-themes** - Sistema de temas

---

## 🆘 Solución de Problemas

### Error: "Firebase not configured"

✅ Verifica que el archivo `.env.local` exista y tenga las variables correctas

### Error: "Unauthorized" al acceder a Firestore

✅ Verifica las reglas de seguridad en Firebase Console
✅ Asegúrate de estar autenticado antes de acceder a las colecciones

### La aplicación no carga estilos

✅ Asegúrate de que Tailwind CSS esté correctamente configurado
✅ Reinicia el servidor de desarrollo (`npm run dev`)

### Los datos no se guardan

✅ Verifica la conexión a Firestore
✅ Revisa la consola del navegador para errores
✅ Comprueba que el usuario esté autenticado

---

## 📞 Soporte

Para cualquier duda o problema:
1. Revisa los logs de la consola del navegador (F12)
2. Verifica los logs de Firebase Console
3. Comprueba que todas las dependencias estén instaladas

---

**✨ ¡Tu portal KODA está listo para usar!**

Desarrollado con las mejores prácticas de Next.js, TypeScript y Firebase.
