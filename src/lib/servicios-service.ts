import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Servicio } from "@/types";

export interface ServicioFormData {
  nombre: string;
  categoria: string;
  tecnologias: string[] | string;
  descripcion?: string;
  disponible: boolean;
}

/**
 * Procesa el campo tecnologías para asegurar que siempre sea un array válido
 */
const procesarTecnologias = (tecnologias: string[] | string): string[] => {
  if (!tecnologias) return [];
  if (typeof tecnologias === "string") {
    return tecnologias
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);
  }
  return Array.isArray(tecnologias) ? tecnologias.filter((t) => t && t.length > 0) : [];
};

export const serviciosService = {
  /**
   * Obtener todos los servicios
   */
  async getAll(): Promise<Servicio[]> {
    const querySnapshot = await getDocs(collection(db, "servicios"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Servicio[];
  },

  /**
   * Crear un nuevo servicio
   */
  async create(data: ServicioFormData): Promise<void> {
    await addDoc(collection(db, "servicios"), {
      nombre: data.nombre,
      categoria: data.categoria,
      tecnologias: procesarTecnologias(data.tecnologias),
      descripcion: data.descripcion || "",
      disponible: data.disponible ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Actualizar un servicio existente
   */
  async update(id: string, data: ServicioFormData): Promise<void> {
    const docRef = doc(db, "servicios", id);
    await updateDoc(docRef, {
      nombre: data.nombre,
      categoria: data.categoria,
      tecnologias: procesarTecnologias(data.tecnologias),
      descripcion: data.descripcion || "",
      disponible: data.disponible ?? true,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Eliminar un servicio
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "servicios", id));
  },
};
