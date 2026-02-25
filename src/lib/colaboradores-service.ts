import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Colaborador } from "@/types";
import { z } from "zod";

// Zod schema for form validation
export const colaboradorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  cargo: z.string().min(1, "El cargo es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  fechaIngreso: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({ required_error: "La fecha de ingreso es requerida" })),
  salario: z.coerce.number().min(0, "El salario no puede ser negativo"),
  estado: z.enum(["Activo", "Inactivo"]),
  notas: z.string().optional(),
});

export type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

const COLABORADORES_COLLECTION = "colaboradores";

const getAll = async (estado?: "Activo" | "Inactivo"): Promise<Colaborador[]> => {
  const coll = collection(db, COLABORADORES_COLLECTION);
  const q = estado ? query(coll, where("estado", "==", estado)) : coll;
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fechaIngreso: doc.data().fechaIngreso?.toDate() || new Date(),
  })) as Colaborador[];
};

const create = async (data: ColaboradorFormData): Promise<void> => {
  await addDoc(collection(db, COLABORADORES_COLLECTION), {
    ...data,
    fechaIngreso: Timestamp.fromDate(data.fechaIngreso),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

const update = async (id: string, data: ColaboradorFormData): Promise<void> => {
  const docRef = doc(db, COLABORADORES_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    fechaIngreso: Timestamp.fromDate(data.fechaIngreso),
    updatedAt: Timestamp.now(),
  });
};

const remove = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLABORADORES_COLLECTION, id));
};

export const colaboradoresService = {
  getAll,
  create,
  update,
  delete: remove,
};