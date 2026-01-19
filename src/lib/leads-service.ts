import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from "firebase/firestore";
import type { Lead } from "@/types";

export interface LeadFormData {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
  notas?: string;
}

export const leadsService = {
  /**
   * Obtener todos los leads
   */
  async getAll(): Promise<Lead[]> {
    const q = query(collection(db, "leads"), orderBy("fechaCreacion", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lead[];
  },

  /**
   * Crear un nuevo lead
   */
  async create(data: LeadFormData): Promise<void> {
    await addDoc(collection(db, "leads"), {
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      estado: data.estado,
      notas: data.notas || "",
      fechaCreacion: Timestamp.now(),
    });
  },

  /**
   * Actualizar un lead existente
   */
  async update(id: string, data: Partial<LeadFormData>): Promise<void> {
    const docRef = doc(db, "leads", id);
    await updateDoc(docRef, {
      ...data,
    });
  },

  /**
   * Eliminar un lead
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "leads", id));
  },

  /**
   * Contar leads por estado
   */
  getEstadoCounts(leads: Lead[]) {
    return {
      todos: leads.length,
      nuevo: leads.filter((l) => l.estado === "nuevo").length,
      contactado: leads.filter((l) => l.estado === "contactado").length,
      negociacion: leads.filter((l) => l.estado === "negociacion").length,
      cerrado: leads.filter((l) => l.estado === "cerrado").length,
      perdido: leads.filter((l) => l.estado === "perdido").length,
    };
  },

  /**
   * Filtrar leads por estado
   */
  filterByEstado(leads: Lead[], estado: string): Lead[] {
    if (estado === "todos") return leads;
    return leads.filter((lead) => lead.estado === estado);
  },
};
