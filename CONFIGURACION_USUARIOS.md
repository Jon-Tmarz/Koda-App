# Gestión de Usuarios con Firebase Extensions

Este sistema gestiona los **perfiles de usuario** almacenando roles y datos adicionales en Firestore, mientras que Firebase Authentication maneja la autenticación.

## 📋 Funcionalidad actual

### ✅ Lo que puedes hacer:
- Ver perfiles de usuarios registrados
- Asignar y cambiar roles (admin/user)
- Editar información de perfil (nombre, rol)
- Eliminar perfiles de Firestore
- Ver último acceso de usuarios

### ⚠️ Limitaciones:
- **NO** puedes crear usuarios desde el panel (se registran normalmente)
- **NO** puedes deshabilitar/habilitar cuentas de Authentication
- **NO** puedes cambiar contraseñas desde el panel
- **NO** puedes ver el email desde Firestore (está en Auth)

---

## 🚀 Opción: Extender con Firebase Extensions

Para funcionalidades administrativas avanzadas, puedes instalar **Firebase Extensions oficiales**:

### Extensiones recomendadas:

#### 1. **Trigger Email from Firestore** (Emails automatizados)
```
Envía emails de bienvenida cuando un usuario se registra
```
[Ver extensión](https://extensions.dev/extensions/firebase/firestore-send-email)

#### 2. **Delete User Data** (Limpieza de datos)
```
Elimina automáticamente los datos del usuario cuando se elimina su cuenta
```
[Ver extensión](https://extensions.dev/extensions/firebase/delete-user-data)

#### 3. **Run Payments with Stripe** (Si necesitas pagos)
```
Gestión de suscripciones y pagos
```

### Cómo instalar una extensión:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"Extensions"**
4. Busca la extensión que necesitas
5. Haz clic en **"Install"**
6. Sigue el asistente de configuración
7. Las extensiones se ejecutan automáticamente con Cloud Functions

### Costos:
- La mayoría de extensiones usan **Cloud Functions** (cargos por ejecución)
- Tier gratuito: hasta 2M invocaciones/mes
- Más info: [Precios de Cloud Functions](https://firebase.google.com/pricing)

---

## 📊 Estructura de datos

### Colección `userProfiles` en Firestore:

```javascript
userProfiles/{uid}
  - nombre: string          // Nombre completo del usuario
  - rol: "admin" | "user"   // Rol del usuario en el sistema
  - ultimoAcceso: timestamp // Última vez que inició sesión
  - createdAt: timestamp    // Cuándo se creó el perfil
  - updatedAt: timestamp    // Última actualización
```

### Datos en Firebase Authentication:
- Email
- Contraseña (hasheada)
- UID
- Estado (enabled/disabled)
- Fecha de creación
- Último inicio de sesión

---

## 🔧 Flujo de registro de usuario

1. Usuario se registra en la aplicación (Firebase Authentication)
2. Se crea automáticamente un perfil en Firestore con rol "user"
3. Admin puede cambiar el rol a "admin" desde el panel
4. El perfil se actualiza con último acceso cada vez que inicia sesión

---

## 🎯 Crear perfil manualmente

Si necesitas crear un perfil para un usuario existente:

1. Ve a **Firebase Console → Authentication**
2. Encuentra al usuario y copia su **UID**
3. En el panel de setup, haz clic en **"Agregar Perfil Manual"**
4. Pega el UID y completa la información
5. Guarda

---

## 🔐 Seguridad

### Reglas de Firestore sugeridas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo admins pueden leer todos los perfiles
    match /userProfiles/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/userProfiles/$(request.auth.uid)).data.rol == 'admin');
      
      // Solo admins pueden escribir
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/userProfiles/$(request.auth.uid)).data.rol == 'admin';
    }
  }
}
```

---

## 💡 Alternativa: Firebase Admin SDK

Si necesitas control total desde código backend (sin Extensions), consulta la documentación de Firebase Admin SDK, pero requerirás:

- Cuenta de servicio con permisos
- Configuración de credenciales en el servidor
- Implementación de API routes propias

**Nota:** Las organizaciones pueden restringir la creación de claves de servicio por políticas de seguridad.
