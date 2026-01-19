import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Herramienta } from "@/types";

export interface HerramientaFormData {
  nombre: string;
  categoria: "licencia" | "infraestructura" | "herramienta" | "otro";
  tipoCobranza: "mensual" | "anual" | "uso" | "unico";
  costo: number;
  descripcion?: string;
  proveedor?: string;
  disponible: boolean;
}

export const herramientasService = {
  /**
   * Obtener todas las herramientas
   */
  async getAll(): Promise<Herramienta[]> {
    const querySnapshot = await getDocs(collection(db, "herramientas"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Herramienta[];
  },

  /**
   * Obtener solo herramientas disponibles
   */
  async getDisponibles(): Promise<Herramienta[]> {
    const q = query(collection(db, "herramientas"), where("disponible", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Herramienta[];
  },

  /**
   * Crear una nueva herramienta
   */
  async create(data: HerramientaFormData): Promise<void> {
    await addDoc(collection(db, "herramientas"), {
      nombre: data.nombre,
      categoria: data.categoria,
      tipoCobranza: data.tipoCobranza,
      costo: Number(data.costo),
      descripcion: data.descripcion || "",
      proveedor: data.proveedor || "",
      disponible: data.disponible ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Actualizar una herramienta existente
   */
  async update(id: string, data: HerramientaFormData): Promise<void> {
    const docRef = doc(db, "herramientas", id);
    await updateDoc(docRef, {
      nombre: data.nombre,
      categoria: data.categoria,
      tipoCobranza: data.tipoCobranza,
      costo: Number(data.costo),
      descripcion: data.descripcion || "",
      proveedor: data.proveedor || "",
      disponible: data.disponible ?? true,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Eliminar una herramienta
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "herramientas", id));
  },
};
