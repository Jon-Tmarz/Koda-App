import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { ConfiguracionGlobal } from "@/types";

const CONFIG_COLLECTION = "configuracion";
const GLOBAL_DOC_ID = "global";

/**
 * Obtiene la configuración global de la aplicación
 */
async function getGlobalConfig(): Promise<ConfiguracionGlobal | null> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, GLOBAL_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ConfiguracionGlobal;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo configuración global:", error);
    throw new Error("No se pudo obtener la configuración global.");
  }
}

export const configService = { getGlobalConfig };