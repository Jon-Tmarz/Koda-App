import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, Timestamp, query, where, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import { type Herramienta, CATEGORIAS_HERRAMIENTA, TIPOS_COBRANZA, DIVISAS } from "@/types";
import { z } from "zod";

// Zod schema for creation
export const herramientaCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  categoria: typeof CATEGORIAS_HERRAMIENTA[number];
  tipoCobranza: typeof TIPOS_COBRANZA[number];
  costo: z.coerce.number().min(0).default(0),
  divisa: z.enum(DIVISAS).default("USD"),
  descripcion?: string;
  proveedor?: string;
  disponible: boolean;
});

// Zod schema for updates (all fields are optional)
export const herramientaUpdateSchema = herramientaCreateSchema.partial();

export type HerramientaCreationData = z.infer<typeof herramientaCreateSchema>;
export type HerramientaUpdateData = z.infer<typeof herramientaUpdateSchema>;

export const herramientasService = {
  /**
   * Obtener todas las herramientas
   */
  async getAll(): Promise<Herramienta[]> {
    const querySnapshot = await getDocs(collection(db, "herramientas"));
  async getAll(filters: Record<string, string> = {}): Promise<Herramienta[]> {
    const coll = collection(db, "herramientas");
    const constraints: QueryConstraint[] = [];

    // Construir filtros dinámicamente
    if (filters.disponible) {
      constraints.push(where("disponible", "==", filters.disponible === 'true'));
    }
    if (filters.categoria) {
      constraints.push(where("categoria", "==", filters.categoria));
    }
    // Nota: Firestore no soporta búsquedas parciales (LIKE) de forma nativa.
    // Para 'nombre' y 'proveedor', se usa un filtro de igualdad.
    // Para búsquedas más avanzadas, se necesitaría un servicio como Algolia o Typesense.
    if (filters.nombre) {
      constraints.push(where("nombre", "==", filters.nombre));
    }
    if (filters.proveedor) {
      constraints.push(where("proveedor", "==", filters.proveedor));
    }

    const q = query(coll, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Herramienta[];
  },

  /**
   * Obtener una herramienta por su ID
   */
  async getById(id: string): Promise<Herramienta | null> {
    const docRef = doc(db, "herramientas", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Herramienta;
    }
    return null;
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
  async create(data: HerramientaCreationData): Promise<string> {
    await addDoc(collection(db, "herramientas"), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    const docRef = await addDoc(collection(db, "herramientas"), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return docRef.id;
  },

  /**
   * Actualizar una herramienta existente
   */
  async update(id: string, data: HerramientaUpdateData): Promise<void> {
    const docRef = doc(db, "herramientas", id);
    // Limpiar undefined para no enviarlos a Firestore
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    if (Object.keys(cleanData).length > 0) {
      await updateDoc(docRef, { ...cleanData, updatedAt: Timestamp.now() });
    }
  },

  /**
   * Eliminar una herramienta
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "herramientas", id));
  },
  herramientaCreateSchema,
  herramientaUpdateSchema,
};
