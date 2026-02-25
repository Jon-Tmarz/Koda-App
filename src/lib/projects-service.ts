import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Quote } from "./quotes-service";

export interface Project {
  id?: string;
  quoteId: string;
  quoteNumber: string;
  projectName: string;
  clienteId: string;
  clienteNombre: string;
  total: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: "No iniciado" | "En progreso" | "Pausado" | "Finalizado" | "Cancelado";
  progress: number; // 0-100
  externalLink?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const PROJECTS_COLLECTION = "projects";

const createFromQuote = async (quote: Quote): Promise<string | null> => {
  if (!quote.id) return null;

  const q = query(collection(db, PROJECTS_COLLECTION), where("quoteId", "==", quote.id));
  const existingProject = await getDocs(q);
  if (!existingProject.empty) {
    console.log("El proyecto para esta cotización ya existe.");
    return existingProject.docs[0].id;
  }

  const newProject: Omit<Project, "id"> = {
    quoteId: quote.id,
    quoteNumber: quote.numero,
    projectName: `Proyecto ${quote.numero}`, // Nombre por defecto
    clienteId: quote.clienteId,
    clienteNombre: quote.clienteNombre,
    total: quote.total,
    startDate: Timestamp.now(),
    status: "No iniciado",
    progress: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject);
  return docRef.id;
};

const getAll = async (statuses?: Project["status"][]): Promise<Project[]> => {
  const coll = collection(db, PROJECTS_COLLECTION);
  const q = statuses?.length ? query(coll, where("status", "in", statuses)) : query(coll);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[];
};

const getById = async (id: string): Promise<Project | null> => {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Project) : null;
};

const update = async (id:string, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<void> => {
  await updateDoc(doc(db, PROJECTS_COLLECTION, id), { ...data, updatedAt: Timestamp.now() });
};

export const projectsService = {
  createFromQuote,
  getAll,
  getById,
  update,
};