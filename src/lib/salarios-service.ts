import { db } from "./firebase";
import { collection, getDocs, getDoc, setDoc, updateDoc, doc, Timestamp, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import type { SalarioConfig, CargoTipo } from "@/types/salarios";

export interface Cargo {
  id?: string;
  nombre: CargoTipo;
  multiplicador: number;
  descripcion?: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTIONS = {
  SALARIOS: "salarios",
  CARGOS: "cargos",
} as const;

/**
 * Convierte un Timestamp de Firestore a Date
 */
const toDate = (ts: Date | { toDate(): Date } | { seconds: number } | null | undefined): Date | undefined => {
  if (!ts) return undefined;
  if (ts instanceof Date) return ts;
  if ("toDate" in ts && typeof ts.toDate === "function") return ts.toDate();
  if ("seconds" in ts) return new Date(ts.seconds * 1000);
  return undefined;
};

export const salariosService = {
  /**
   * Obtiene la configuración de salario para un año específico
   */
  async getConfigByYear(año: number): Promise<SalarioConfig | null> {
    try {
      const docRef = doc(db, COLLECTIONS.SALARIOS, año.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as SalarioConfig;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener configuración de salario por año:", error);
      throw error;
    }
  },

  /**
   * Obtiene la configuración de salario más reciente
   */
  async getLatestConfig(): Promise<SalarioConfig | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SALARIOS),
        orderBy("año", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as SalarioConfig;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener última configuración de salario:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las configuraciones de salario
   */
  async getAllConfigs(): Promise<SalarioConfig[]> {
    try {
      const q = query(collection(db, COLLECTIONS.SALARIOS), orderBy("año", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as SalarioConfig;
      });
    } catch (error) {
      console.error("Error al obtener todas las configuraciones de salario:", error);
      throw error;
    }
  },

  /**
   * Guarda o actualiza una configuración de salario
   */
  async saveConfig(config: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SALARIOS, config.año.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...config,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          ...config,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error al guardar configuración de salario:", error);
      throw error;
    }
  },

  /**
   * Elimina una configuración de salario
   */
  async deleteConfig(año: number): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SALARIOS, año.toString());
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar configuración de salario:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los cargos configurados
   */
  async getCargos(): Promise<Cargo[]> {
    try {
      const q = query(collection(db, COLLECTIONS.CARGOS), orderBy("multiplicador", "asc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as Cargo;
      });
    } catch (error) {
      console.error("Error al obtener cargos:", error);
      throw error;
    }
  },

  /**
   * Guarda o actualiza un cargo
   */
  async saveCargo(cargo: Omit<Cargo, "id" | "createdAt" | "updatedAt">): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CARGOS, cargo.nombre);
      await setDoc(docRef, {
        ...cargo,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error al guardar cargo:", error);
      throw error;
    }
  },

  /**
   * Elimina un cargo
   */
  async deleteCargo(nombre: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.CARGOS, nombre);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar cargo:", error);
      throw error;
    }
  }
};
