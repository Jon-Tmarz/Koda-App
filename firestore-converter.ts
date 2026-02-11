import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

/**
 * Conversor genérico de Firestore que maneja Timestamps y IDs.
 * - `toFirestore`: Convierte objetos de la app a datos para Firestore.
 * - `fromFirestore`: Convierte documentos de Firestore a objetos de la app,
 *   transformando Timestamps en Dates y añadiendo el ID del documento.
 */
export const genericConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore(data: T): DocumentData {
    // Aquí podrías añadir lógica para convertir Dates a Timestamps si fuera necesario
    return data as DocumentData;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): T {
    const data = snapshot.data(options);
    // Transforma Timestamps a Dates y añade el ID
    // (Esta es una implementación simple, se puede hacer más robusta para objetos anidados)
    return { ...data, id: snapshot.id } as T;
  },
});