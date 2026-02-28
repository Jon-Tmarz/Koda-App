import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, orderBy, limit, getDoc, } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Quote, QuoteItem } from "@/types";

/**
 * Datos necesarios para crear una cotización.
 * Se omiten los campos generados automáticamente por el servicio o la base de datos.
 */
export type QuoteCreationData = Omit<Quote, "id" | "fecha" | "aprobacionNotas" | "createdAt" | "updatedAt" | "items"> & { items: Omit<QuoteItem, "subtotal">[] };

const QUOTES_COLLECTION = "cotizaciones";

const getAll = async (): Promise<Quote[]> => {
  const coll = collection(db, QUOTES_COLLECTION);
  const q = query(coll, orderBy("fecha", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fecha: new Date(doc.data().fecha?.toDate?.() || doc.data().fecha || Date.now()),
    createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate?.() || doc.data().createdAt) : undefined,
    updatedAt: doc.data().updatedAt ? new Date(doc.data().updatedAt.toDate?.() || doc.data().updatedAt) : undefined,
  })) as Quote[];
};

const getById = async (id: string): Promise<Quote | null> => {
    const docRef = doc(db, QUOTES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return {
        id: docSnap.id,
        ...docSnap.data(),
        fecha: new Date(docSnap.data().fecha?.toDate?.() || docSnap.data().fecha || Date.now()),
        createdAt: docSnap.data().createdAt ? new Date(docSnap.data().createdAt.toDate?.() || docSnap.data().createdAt) : undefined,
        updatedAt: docSnap.data().updatedAt ? new Date(docSnap.data().updatedAt.toDate?.() || docSnap.data().updatedAt) : undefined,
    } as Quote;
};

const create = async (data: QuoteCreationData): Promise<string> => {
  const docRef = await addDoc(collection(db, QUOTES_COLLECTION), {
    ...data,
    fecha: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

const update = async (id: string, data: Partial<Omit<Quote, "id" | "createdAt" | "fecha">>): Promise<void> => {
  // Clonamos el objeto para no mutar el original
  const cleanData = { ...data };

  // Eliminamos cualquier propiedad que sea 'undefined' para evitar errores de Firestore
  for (const key in cleanData) {
    if (Object.prototype.hasOwnProperty.call(cleanData, key)) {
      if (cleanData[key as keyof typeof cleanData] === undefined) {
        delete cleanData[key as keyof typeof cleanData];
      }
    }
  }

  const docRef = doc(db, QUOTES_COLLECTION, id);
  await updateDoc(docRef, { ...cleanData, updatedAt: Timestamp.now() });
};

const remove = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, QUOTES_COLLECTION, id));
};

const getNextQuoteNumber = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `CT-${month}-${year}-`;
  
    const coll = collection(db, QUOTES_COLLECTION);
    const q = query(coll, where("numero", ">=", prefix), where("numero", "<", `CT-${month}-${year}-~`), orderBy("numero", "desc"), limit(1));
  
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      return `${prefix}0001`;
    } else {
      const lastNumber = querySnapshot.docs[0].data().numero;
      const lastConsecutive = parseInt(lastNumber.split('-').pop() || '0', 10);
      const newConsecutive = (lastConsecutive + 1).toString().padStart(4, '0');
      return `${prefix}${newConsecutive}`;
    }
};

export const quotesService = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getNextQuoteNumber,
};