import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface CotizacionItem {
  descripcion: string;
  horas: number;
  costoPorHora: number;
  subtotal: number;
}

export interface Cotizacion {
  id?: string;
  numero: string;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  fecha: Timestamp;
  pdfUrl?: string;
}

export interface CotizacionFormData {
  numero: string;
  cliente: string;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  pdfUrl?: string;
}

export const cotizacionesService = {
  /**
   * Obtener todas las cotizaciones
   */
  async getAll(): Promise<Cotizacion[]> {
    const q = query(collection(db, "cotizaciones"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Cotizacion[];
  },

  /**
   * Crear una nueva cotizaci\u00f3n
   */
  async create(data: Omit<Cotizacion, "id">): Promise<void> {
    await addDoc(collection(db, "cotizaciones"), {
      numero: data.numero,
      items: data.items,
      subtotal: data.subtotal,
      iva: data.iva,
      total: data.total,
      estado: data.estado,
      fecha: data.fecha || Timestamp.now(),
      pdfUrl: data.pdfUrl || "",
    });
  },

  /**
   * Actualizar una cotizaci\u00f3n existente
   */
  async update(id: string, data: Partial<Cotizacion>): Promise<void> {
    const docRef = doc(db, "cotizaciones", id);
    await updateDoc(docRef, {
      ...data,
    });
  },

  /**
   * Eliminar una cotizaci\u00f3n
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "cotizaciones", id));
  },

  /**
   * Generar n\u00famero de cotizaci\u00f3n autom\u00e1tico
   */
  generarNumero(cantidadActual: number): string {
    const año = new Date().getFullYear();
    const numero = (cantidadActual + 1).toString().padStart(4, "0");
    return `COT-${año}-${numero}`;
  },
};
