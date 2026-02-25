import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import type { Lead } from "@/types";

export interface LeadFormData {
  contacto: string;
  empresa: string;
  email: string;
  telefono?: string;
  estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
  notas?: string;
}

export const leadsService = {
  /**
   * Obtener todos los leads
   */
  async getAll(): Promise<Lead[]> {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as Lead[];
  },

  /**
   * Crear un nuevo lead
   */
  async create(data: LeadFormData): Promise<string> {
    const docRef = await addDoc(collection(db, "leads"), {
      ...data,
      notas: data.notas || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Actualizar un lead existente
   */
  async update(id: string, data: Partial<LeadFormData>): Promise<void> {
    const docRef = doc(db, "leads", id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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
