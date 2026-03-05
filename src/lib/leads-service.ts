import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Lead } from "@/types";
import { z } from "zod";

const LEAD_ESTADOS = ["nuevo", "contactado", "negociacion", "cerrado", "perdido"] as const;

export const leadCreateSchema = z.object({
  contacto: z.string().min(1, "El nombre de contacto es requerido."),
  empresa: z.string().min(1, "El nombre de la empresa es requerido."),
  email: z.string().email("El formato del email no es válido."),
  telefono: z.string().optional(),
  estado: z.enum(LEAD_ESTADOS).default("nuevo"),
  notas: z.string().optional(),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export type LeadCreationData = z.infer<typeof leadCreateSchema>;

const LEADS_COLLECTION = "leads";

const getAll = async (): Promise<Lead[]> => {
  const coll = collection(db, LEADS_COLLECTION);
  const q = query(coll, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()) : undefined,
    updatedAt: doc.data().updatedAt ? new Date(doc.data().updatedAt.toDate()) : undefined,
  })) as Lead[];
};

const getById = async (id: string): Promise<Lead | null> => {
  const docRef = doc(db, LEADS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : undefined,
  } as Lead;
};

const create = async (data: LeadCreationData): Promise<string> => {
  const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

const update = async (id: string, data: z.infer<typeof leadUpdateSchema>): Promise<void> => {
  const cleanData = { ...data };

  for (const key in cleanData) {
    if (Object.prototype.hasOwnProperty.call(cleanData, key)) {
      if (cleanData[key as keyof typeof cleanData] === undefined) {
        delete cleanData[key as keyof typeof cleanData];
      }
    }
  }

  const docRef = doc(db, LEADS_COLLECTION, id);
  await updateDoc(docRef, { ...cleanData, updatedAt: Timestamp.now() });
};

const remove = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, LEADS_COLLECTION, id));
};

export const leadsService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  leadCreateSchema,
  leadUpdateSchema,
};