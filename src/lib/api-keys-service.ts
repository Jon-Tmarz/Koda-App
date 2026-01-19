// src/lib/api-keys-service.ts
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import type { APIKey } from "@/types";
import crypto from "crypto";

const COLLECTION_NAME = "apiKeys";

// Generar una API key segura
export function generateAPIKey(): string {
  // Generar un UUID v4 + timestamp + random string
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `koda_${timestamp}_${randomBytes}`;
}

// Hashear la API key para almacenarla
export function hashAPIKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Obtener todas las API keys
export async function getAPIKeys(): Promise<APIKey[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      ultimoUso: doc.data().ultimoUso?.toDate(),
    } as APIKey));
  } catch (error) {
    console.error("Error obteniendo API keys:", error);
    throw error;
  }
}

// Crear una nueva API key
export async function createAPIKey(nombre: string, descripcion?: string): Promise<{ key: string; apiKey: APIKey }> {
  try {
    // Generar la key
    const key = generateAPIKey();
    const hashedKey = hashAPIKey(key);
    
    // Crear el documento
    const apiKeyData = {
      nombre,
      descripcion: descripcion || "",
      key: hashedKey, // Guardamos el hash, no la key original
      activa: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), apiKeyData);
    
    // Retornar la key original (solo se muestra una vez)
    return {
      key, // La key original se retorna solo una vez
      apiKey: {
        id: docRef.id,
        ...apiKeyData,
        key: hashedKey,
      } as APIKey
    };
  } catch (error) {
    console.error("Error creando API key:", error);
    throw error;
  }
}

// Actualizar una API key
export async function updateAPIKey(id: string, data: Partial<APIKey>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando API key:", error);
    throw error;
  }
}

// Eliminar una API key
export async function deleteAPIKey(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error eliminando API key:", error);
    throw error;
  }
}

// Validar una API key
export async function validateAPIKey(apiKey: string): Promise<APIKey | null> {
  try {
    const hashedKey = hashAPIKey(apiKey);
    const q = query(
      collection(db, COLLECTION_NAME),
      where("key", "==", hashedKey),
      where("activa", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0];
    
    // Actualizar último uso
    await updateDoc(doc(db, COLLECTION_NAME, docData.id), {
      ultimoUso: serverTimestamp(),
    });
    
    return {
      id: docData.id,
      ...docData.data(),
      createdAt: docData.data().createdAt?.toDate(),
      updatedAt: docData.data().updatedAt?.toDate(),
      ultimoUso: new Date(),
    } as APIKey;
  } catch (error) {
    console.error("Error validando API key:", error);
    return null;
  }
}
