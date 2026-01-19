// src/lib/users-service.ts
import { 
  collection,
  doc, 
  getDoc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { UserProfile } from "@/types";
import { onAuthStateChanged } from "firebase/auth";

const USER_PROFILES_COLLECTION = "userProfiles";

// Obtener todos los perfiles de usuarios
export async function getUserProfiles(): Promise<UserProfile[]> {
  try {
    const profilesRef = collection(db, USER_PROFILES_COLLECTION);
    const q = query(profilesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      ultimoAcceso: doc.data().ultimoAcceso?.toDate(),
    })) as UserProfile[];
  } catch (error) {
    console.error("Error al obtener perfiles de usuarios:", error);
    throw error;
  }
}

// Obtener perfil de usuario por UID
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, USER_PROFILES_COLLECTION, uid));
    
    if (!profileDoc.exists()) {
      return null;
    }
    
    return {
      uid: profileDoc.id,
      ...profileDoc.data(),
      createdAt: profileDoc.data().createdAt?.toDate(),
      updatedAt: profileDoc.data().updatedAt?.toDate(),
      ultimoAcceso: profileDoc.data().ultimoAcceso?.toDate(),
    } as UserProfile;
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    throw error;
  }
}

// Crear perfil de usuario en Firestore
// Nota: El usuario ya debe existir en Firebase Authentication
export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<void> {
  try {
    await setDoc(doc(db, USER_PROFILES_COLLECTION, uid), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al crear perfil de usuario:", error);
    throw error;
  }
}

// Actualizar perfil de usuario
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, uid);
    
    // Verificar que el perfil existe
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) {
      throw new Error("Perfil de usuario no encontrado");
    }

    await updateDoc(profileRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error);
    throw error;
  }
}

// Eliminar perfil de usuario
export async function deleteUserProfile(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USER_PROFILES_COLLECTION, uid));
  } catch (error) {
    console.error("Error al eliminar perfil de usuario:", error);
    throw error;
  }
}

// Cambiar rol de usuario
export async function changeUserRole(uid: string, rol: "admin" | "user"): Promise<void> {
  try {
    await updateUserProfile(uid, { rol });
  } catch (error) {
    console.error("Error al cambiar rol de usuario:", error);
    throw error;
  }
}

// Actualizar último acceso
export async function updateLastAccess(uid: string): Promise<void> {
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      ultimoAcceso: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al actualizar último acceso:", error);
    // No lanzar error, es una operación no crítica
  }
}

// Verificar si un usuario es admin
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(uid);
    return profile?.rol === "admin";
  } catch (error) {
    console.error("Error al verificar rol de admin:", error);
    return false;
  }
}

// Obtener el usuario autenticado actual
export async function getCurrentUser(): Promise<{ uid: string; email: string | null } | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve({ uid: user.uid, email: user.email });
      } else {
        resolve(null);
      }
    });
  });
}
