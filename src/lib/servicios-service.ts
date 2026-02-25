import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Servicio } from "@/types";

/**
 * Tipo para los datos del formulario de servicio.
 * Se basa en la interfaz `Servicio`, pero permite que `tecnologias` sea un string.
 */
export type ServicioFormData = Omit<Servicio, "id" | "createdAt" | "updatedAt" | "tecnologias"> & {
  tecnologias: string[] | string;
};

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
    const q = query(collection(db, "servicios"), orderBy("nombre", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as Servicio[];
  },

  /**
   * Obtener solo los servicios disponibles
   */
  async getDisponibles(): Promise<Servicio[]> {
    const q = query(collection(db, "servicios"), where("disponible", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as Servicio[];
  },

  /**
   * Crear un nuevo servicio
   */
  async create(data: ServicioFormData): Promise<void> {
    await addDoc(collection(db, "servicios"), {
      ...data,
      tecnologias: procesarTecnologias(data.tecnologias),
      descripcion: data.descripcion || "",
      cargosSugeridos: data.cargosSugeridos || [],
      disponible: data.disponible ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Actualizar un servicio existente
   */
  async update(id: string, data: Partial<ServicioFormData>): Promise<void> {
    const docRef = doc(db, "servicios", id);
    const dataToUpdate: { [key: string]: any } = { ...data };

    if (data.tecnologias !== undefined) {
      dataToUpdate.tecnologias = procesarTecnologias(data.tecnologias);
    }

    await updateDoc(docRef, {
      ...dataToUpdate,
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
