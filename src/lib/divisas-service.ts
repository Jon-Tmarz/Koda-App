// src/lib/divisas-service.ts
import { collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const DIVISAS_COLLECTION = "divisas";
const MAX_RECORDS = 25;

export interface ExchangeRate {
  id?: string;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  timestamp: Timestamp;
  createdAt: Date;
}

/**
 * Consulta el endpoint de la API de divisas y retorna el rate
 */
export async function fetchExchangeRate(): Promise<number> {
  const apiUrl = process.env.NEXT_PUBLIC_EXCHANGE_API_KEY;
  const rateKey = process.env.NEXT_PUBLIC_EXCHANGE_REQ;

  if (!apiUrl || !rateKey) {
    throw new Error(
      "Las variables de entorno NEXT_PUBLIC_EXCHANGE_API_KEY y NEXT_PUBLIC_EXCHANGE_REQ deben estar definidas"
    );
  }

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Obtener el valor usando la key de la variable de entorno
    const rate = data[rateKey];

    if (!rate || typeof rate !== "number") {
      throw new Error(`No se encontró el rate en la respuesta de la API con la key: ${rateKey}`);
    }

    console.log(`✅ Exchange rate obtenido: ${rate} USD -> COP`);
    return rate;
  } catch (error) {
    console.error("❌ Error al consultar la API de divisas:", error);
    throw error;
  }
}

/**
 * Guarda el rate de cambio en Firestore y mantiene solo los últimos 25 registros
 */
export async function saveExchangeRate(rate: number): Promise<string> {
  try {
    // Crear el registro
    const exchangeRate: Omit<ExchangeRate, "id"> = {
      rate,
      fromCurrency: "USD",
      toCurrency: "COP",
      timestamp: Timestamp.now(),
      createdAt: new Date(),
    };

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, DIVISAS_COLLECTION), exchangeRate);
    console.log(`✅ Exchange rate guardado con ID: ${docRef.id}`);

    // Mantener solo los últimos 25 registros
    await cleanOldRecords();

    return docRef.id;
  } catch (error) {
    console.error("❌ Error al guardar el exchange rate:", error);
    throw error;
  }
}

/**
 * Elimina los registros más antiguos, dejando solo los últimos 25
 */
async function cleanOldRecords(): Promise<void> {
  try {
    const divisasRef = collection(db, DIVISAS_COLLECTION);
    const q = query(divisasRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const totalRecords = snapshot.docs.length;

    if (totalRecords > MAX_RECORDS) {
      // Obtener los documentos a eliminar (los que están después del límite)
      const docsToDelete = snapshot.docs.slice(MAX_RECORDS);

      console.log(`🗑️ Eliminando ${docsToDelete.length} registros antiguos...`);

      // Eliminar documentos en lote
      const deletePromises = docsToDelete.map((docSnapshot) =>
        deleteDoc(doc(db, DIVISAS_COLLECTION, docSnapshot.id))
      );

      await Promise.all(deletePromises);
      console.log(`✅ ${docsToDelete.length} registros eliminados correctamente`);
    } else {
      console.log(`ℹ️ Total de registros: ${totalRecords}. No es necesario eliminar.`);
    }
  } catch (error) {
    console.error("❌ Error al limpiar registros antiguos:", error);
    throw error;
  }
}

/**
 * Obtiene todos los exchange rates almacenados (máximo 25)
 */
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const divisasRef = collection(db, DIVISAS_COLLECTION);
    const q = query(divisasRef, orderBy("timestamp", "desc"), limit(MAX_RECORDS));
    const snapshot = await getDocs(q);

    const rates: ExchangeRate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().timestamp?.toDate() || new Date(),
    })) as ExchangeRate[];

    return rates;
  } catch (error) {
    console.error("❌ Error al obtener exchange rates:", error);
    throw error;
  }
}

/**
 * Obtiene el último exchange rate almacenado
 */
export async function getLatestExchangeRate(): Promise<ExchangeRate | null> {
  try {
    const divisasRef = collection(db, DIVISAS_COLLECTION);
    const q = query(divisasRef, orderBy("timestamp", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("ℹ️ No hay exchange rates almacenados");
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().timestamp?.toDate() || new Date(),
    } as ExchangeRate;
  } catch (error) {
    console.error("❌ Error al obtener el último exchange rate:", error);
    throw error;
  }
}

/**
 * Función principal que consulta la API y guarda el resultado
 */
export async function updateExchangeRate(): Promise<ExchangeRate> {
  try {
    console.log("🔄 Consultando exchange rate...");
    const rate = await fetchExchangeRate();

    console.log("💾 Guardando exchange rate en Firestore...");
    const docId = await saveExchangeRate(rate);

    const savedRate: ExchangeRate = {
      id: docId,
      rate,
      fromCurrency: "USD",
      toCurrency: "COP",
      timestamp: Timestamp.now(),
      createdAt: new Date(),
    };

    console.log("✅ Exchange rate actualizado correctamente");
    return savedRate;
  } catch (error) {
    console.error("❌ Error al actualizar exchange rate:", error);
    throw error;
  }
}
