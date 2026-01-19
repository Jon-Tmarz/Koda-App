// src/lib/auth-helpers.ts
import { User } from "firebase/auth";
import { createUserProfile, getUserProfile, updateLastAccess } from "./users-service";

/**
 * Inicializa el perfil de usuario en Firestore cuando se registra o inicia sesión
 */
export async function initializeUserProfile(user: User): Promise<void> {
  try {
    const profile = await getUserProfile(user.uid);
    
    if (!profile) {
      // Crear perfil si no existe
      await createUserProfile(user.uid, {
        nombre: user.displayName || user.email?.split("@")[0] || "Usuario",
        rol: "user", // Por defecto todos son users
      });
      console.log("✅ Perfil de usuario creado:", user.uid);
    } else {
      // Actualizar último acceso si el perfil ya existe
      await updateLastAccess(user.uid);
      console.log("✅ Último acceso actualizado:", user.uid);
    }
  } catch (error) {
    console.error("❌ Error al inicializar perfil de usuario:", error);
    // No lanzar error para no interrumpir el flujo de autenticación
  }
}
