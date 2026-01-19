// Servicios de Firestore para manejo de datos dinámicos
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { SalarioConfig, CargoTipo } from "@/types/salarios";
import { DEFAULT_SALARIO_CONFIG, CARGO_MULTIPLICADORES } from "@/types/salarios";
import { updateExchangeRate } from "./divisas-service";

// ===== COLECCIONES =====
const COLLECTIONS = {
  SALARIO_CONFIGS: "salarios", // Mantener consistencia con páginas existentes
  CARGOS: "cargos",
  CARGOS_CALCULADOS: "cargosCalculados", // Nueva: almacena cálculos dinámicos por cargo/año
  SERVICIOS: "servicios",
  LEADS: "leads",
  COTIZACIONES: "cotizaciones",
  TALENTO: "talento",
  CONFIGURACION: "configuracion",
} as const;

// ===== TIPOS =====
export interface FirestoreSalarioConfig extends Omit<SalarioConfig, "createdAt" | "updatedAt"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Cargo {
  id?: string;
  nombre: CargoTipo;
  multiplicador: number;
  descripcion?: string;
  activo: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Servicio {
  id?: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  cargosSugeridos?: CargoTipo[];
  costos?: { nombre: string; costo: number; recurrencia: string; descripcion?: string }[];
  activo: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Lead {
  id?: string;
  empresa: string;
  contacto: string;
  email: string;
  telefono?: string;
  estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
  notas?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ColaboradorAsignado {
  nombre: string;
  cargo: CargoTipo;
  horasAsignadas?: number; // Horas estimadas para este colaborador
}

export interface Cotizacion {
  id?: string;
  leadId?: string;
  numero: string;
  fecha: Timestamp;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  tiempoEstimado?: number; // En horas
  subtotalNegociado?: number; // Valor negociado sin IVA
  totalNegociado?: number; // Valor negociado con IVA
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  pdfUrl?: string; // URL del PDF generado
  notas?: NotaCotizacion[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CotizacionItem {
  descripcion: string;
  colaboradores?: ColaboradorAsignado[]; // Colaboradores asignados al proyecto
  horas: number;
  costoPorHora: number;
  subtotal: number;
}

export interface NotaCotizacion {
  texto: string;
  fecha: Timestamp;
  autor?: string;
}

export interface Talento {
  id?: string;
  nombre: string;
  cargo: CargoTipo;
  email: string;
  telefono?: string;
  habilidades: string[];
  activo: boolean;
  fechaIngreso?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Interface para cálculos dinámicos de cargos
 * 
 * LÓGICA DE CÁLCULO:
 * 1. Se toma el salarioBase (ej: 1,423,500)
 * 2. + auxilioTransporte (si aplica)
 * 3. × costoEmpleado (prestaciones, seguridad social)
 * 4. + ganancia (% de margen para la empresa)
 * 5. + IVA (19%)
 * 6. = totalCalculado
 * 7. × MULTIPLICADOR del cargo (1x, 2x, 3x, 4x, 5x, 7x) ← SE APLICA AL FINAL
 * 8. = totalMensual
 * 
 * Esto garantiza que todos los costos se incluyen ANTES de aplicar el multiplicador,
 * evitando pérdidas para la empresa.
 */
export interface CargoCalculado {
  id?: string; // formato: "{año}_{cargo}" ej: "2025_Profesional"
  año: number;
  cargo: CargoTipo;
  multiplicador: number; // Se aplica AL FINAL sobre el total calculado
  
  // Datos mensuales (valores base SIN multiplicador)
  salarioBaseCargo: number; // Salario base fijo (NO multiplicado)
  auxilioTransporte: number; // Auxilio de transporte (si aplica)
  salarioBruto: number; // base + auxilio
  costoEmpresa: number; // Incluye prestaciones y seguridad social
  gananciaValor: number; // Margen de ganancia para la empresa
  subtotalMensual: number; // Costo + ganancia (antes de IVA y multiplicador)
  ivaMensual: number; // IVA sobre subtotal
  totalMensual: number; // INCLUYE multiplicador aplicado al final
  
  // Datos por hora (calculados desde valores mensuales)
  horasLegales: number; // Horas mensuales para cálculo
  salarioHoraBase: number; // Salario base / horas
  costoHoraEmpresa: number; // Costo empresa / horas
  gananciaHora: number; // Ganancia / horas
  ivaHora: number; // IVA / horas
  totalPorHora: number; // Total mensual / horas (incluye multiplicador)
  
  // Metadata
  activo: boolean;
  descripcion?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ===== FUNCIONES HELPER =====
function convertTimestampToDate(timestamp: Timestamp | undefined): Date | undefined {
  return timestamp?.toDate();
}

// ===== SALARIO CONFIGS =====

/**
 * Obtiene la configuración de salario para un año específico
 */
export async function getSalarioConfig(año: number): Promise<SalarioConfig | null> {
  try {
    const configRef = doc(db, COLLECTIONS.SALARIO_CONFIGS, año.toString());
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const data = configSnap.data() as FirestoreSalarioConfig;
      return {
        ...data,
        id: configSnap.id,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo config de salario:", error);
    throw error;
  }
}

/**
 * Obtiene la configuración de salario más reciente
 */
export async function getLatestSalarioConfig(): Promise<SalarioConfig | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.SALARIO_CONFIGS),
      orderBy("año", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirestoreSalarioConfig;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo última config:", error);
    throw error;
  }
}

/**
 * Obtiene todas las configuraciones de salario
 */
export async function getAllSalarioConfigs(): Promise<SalarioConfig[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.SALARIO_CONFIGS),
      orderBy("año", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreSalarioConfig;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      };
    });
  } catch (error) {
    console.error("Error obteniendo configs:", error);
    throw error;
  }
}

/**
 * Crea o actualiza una configuración de salario
 */
export async function saveSalarioConfig(
  config: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = doc(db, COLLECTIONS.SALARIO_CONFIGS, config.año.toString());
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      await updateDoc(docRef, {
        ...config,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...config,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return config.año.toString();
  } catch (error) {
    console.error("Error guardando config:", error);
    throw error;
  }
}

// ===== CARGOS =====

/**
 * Obtiene todos los cargos
 */
export async function getCargos(): Promise<Cargo[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CARGOS),
      orderBy("multiplicador", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Cargo[];
  } catch (error) {
    console.error("Error obteniendo cargos:", error);
    throw error;
  }
}

/**
 * Guarda un cargo
 */
export async function saveCargo(cargo: Omit<Cargo, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const docRef = doc(db, COLLECTIONS.CARGOS, cargo.nombre);
    await setDoc(docRef, {
      ...cargo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return cargo.nombre;
  } catch (error) {
    console.error("Error guardando cargo:", error);
    throw error;
  }
}

// ===== SERVICIOS =====

/**
 * Obtiene todos los servicios
 */
export async function getServicios(): Promise<Servicio[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SERVICIOS));
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Servicio[];
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    throw error;
  }
}

/**
 * Guarda un servicio
 */
export async function saveServicio(
  servicio: Omit<Servicio, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SERVICIOS), {
      ...servicio,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error guardando servicio:", error);
    throw error;
  }
}

// ===== LEADS =====

/**
 * Obtiene todos los leads
 */
export async function getLeads(): Promise<Lead[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.LEADS),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
    })) as Lead[];
  } catch (error) {
    console.error("Error obteniendo leads:", error);
    throw error;
  }
}

/**
 * Obtiene un lead por ID
 */
export async function getLead(id: string): Promise<Lead | null> {
  try {
    const docRef = doc(db, COLLECTIONS.LEADS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id,
        createdAt: convertTimestampToDate(docSnap.data().createdAt),
        updatedAt: convertTimestampToDate(docSnap.data().updatedAt),
      } as Lead;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo lead:", error);
    throw error;
  }
}

/**
 * Crea un nuevo lead
 */
export async function createLead(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), {
      ...lead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creando lead:", error);
    throw error;
  }
}

/**
 * Actualiza un lead existente
 */
export async function updateLead(
  id: string,
  lead: Partial<Omit<Lead, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LEADS, id);
    await updateDoc(docRef, {
      ...lead,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando lead:", error);
    throw error;
  }
}

/**
 * Elimina un lead
 */
export async function deleteLead(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.LEADS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error eliminando lead:", error);
    throw error;
  }
}

/**
 * Guarda un lead (legacy - usar createLead o updateLead)
 * @deprecated Usar createLead o updateLead en su lugar
 */
export async function saveLead(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createLead(lead);
}

// ===== COTIZACIONES =====

/**
 * Obtiene todas las cotizaciones
 */
export async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.COTIZACIONES),
      orderBy("fecha", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Cotizacion[];
  } catch (error) {
    console.error("Error obteniendo cotizaciones:", error);
    throw error;
  }
}

/**
 * Obtiene una cotización por ID
 */
export async function getCotizacionById(id: string): Promise<Cotizacion | null> {
  try {
    const docRef = doc(db, COLLECTIONS.COTIZACIONES, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      ...docSnap.data(),
      id: docSnap.id,
    } as Cotizacion;
  } catch (error) {
    console.error("Error obteniendo cotización por ID:", error);
    throw error;
  }
}

/**
 * Guarda una cotización
 */
export async function saveCotizacion(
  cotizacion: Omit<Cotizacion, "id" | "createdAt" | "updatedAt">
) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.COTIZACIONES), {
      ...cotizacion,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.error("Error guardando cotización:", error);
    throw error;
  }
}

/**
 * Actualiza una cotización existente
 */
export async function updateCotizacion(
  id: string,
  data: Partial<Omit<Cotizacion, "id" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.COTIZACIONES, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando cotización:", error);
    throw error;
  }
}

/**
 * Actualiza los valores negociados de una cotización
 */
export async function updateCotizacionNegociada(
  id: string,
  subtotalNegociado: number,
  iva: number
): Promise<void> {
  try {
    const totalNegociado = subtotalNegociado + iva;
    const docRef = doc(db, COLLECTIONS.COTIZACIONES, id);
    await updateDoc(docRef, {
      subtotalNegociado,
      totalNegociado,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando valores negociados:", error);
    throw error;
  }
}

/**
 * Elimina una cotización
 */
export async function deleteCotizacion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COTIZACIONES, id));
  } catch (error) {
    console.error("Error eliminando cotización:", error);
    throw error;
  }
}

/**
 * Agrega una nota a una cotización existente
 */
export async function agregarNotaCotizacion(
  cotizacionId: string,
  texto: string,
  autor?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.COTIZACIONES, cotizacionId);
    const cotizacionSnap = await getDoc(docRef);

    if (!cotizacionSnap.exists()) {
      throw new Error("Cotización no encontrada");
    }

    const cotizacion = cotizacionSnap.data() as Cotizacion;
    const nuevaNota: NotaCotizacion = {
      texto,
      fecha: Timestamp.now(),
      autor,
    };

    const notasActualizadas = [...(cotizacion.notas || []), nuevaNota];

    await updateDoc(docRef, {
      notas: notasActualizadas,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error agregando nota a cotización:", error);
    throw error;
  }
}

// ===== TALENTO =====

/**
 * Obtiene todo el talento
 */
export async function getTalento(): Promise<Talento[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TALENTO),
      orderBy("nombre", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Talento[];
  } catch (error) {
    console.error("Error obteniendo talento:", error);
    throw error;
  }
}

/**
 * Guarda un registro de talento
 */
export async function saveTalento(
  talento: Omit<Talento, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TALENTO), {
      ...talento,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error guardando talento:", error);
    throw error;
  }
}

/**
 * Actualiza un registro de talento
 */
export async function updateTalento(
  id: string,
  data: Partial<Omit<Talento, "id" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.TALENTO, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando talento:", error);
    throw error;
  }
}

/**
 * Elimina un registro de talento
 */
export async function deleteTalento(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TALENTO, id));
  } catch (error) {
    console.error("Error eliminando talento:", error);
    throw error;
  }
}

// ===== CARGOS CALCULADOS (DINÁMICOS) =====

/**
 * Obtiene un cargo calculado específico por año y cargo
 */
export async function getCargoCalculado(
  año: number,
  cargo: CargoTipo
): Promise<CargoCalculado | null> {
  try {
    const docId = `${año}_${cargo}`;
    const docRef = doc(db, COLLECTIONS.CARGOS_CALCULADOS, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id,
      } as CargoCalculado;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo cargo calculado:", error);
    throw error;
  }
}

/**
 * Obtiene todos los cargos calculados para un año específico
 */
export async function getCargosCalculadosPorAño(año: number): Promise<CargoCalculado[]> {
  try {
    const collectionRef = collection(db, COLLECTIONS.CARGOS_CALCULADOS);
    const querySnapshot = await getDocs(collectionRef);
    
    const cargos = querySnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }) as CargoCalculado)
      .filter((cargo) => cargo.año === año)
      .sort((a, b) => a.multiplicador - b.multiplicador);

    return cargos;
  } catch (error) {
    console.error("Error obteniendo cargos calculados por año:", error);
    throw error;
  }
}

/**
 * Obtiene todos los cargos calculados
 */
export async function getAllCargosCalculados(): Promise<CargoCalculado[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CARGOS_CALCULADOS));
    
    return querySnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }) as CargoCalculado)
      .sort((a, b) => {
        if (a.año !== b.año) return b.año - a.año; // Más reciente primero
        return a.multiplicador - b.multiplicador; // Menor multiplicador primero
      });
  } catch (error) {
    console.error("Error obteniendo todos los cargos calculados:", error);
    throw error;
  }
}

/**
 * Guarda o actualiza un cargo calculado
 */
export async function saveCargoCalculado(
  cargoCalculado: Omit<CargoCalculado, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docId = `${cargoCalculado.año}_${cargoCalculado.cargo}`;
    const docRef = doc(db, COLLECTIONS.CARGOS_CALCULADOS, docId);
    const existingDoc = await getDoc(docRef);

    const dataToSave = {
      ...cargoCalculado,
      updatedAt: serverTimestamp(),
    };

    if (existingDoc.exists()) {
      await updateDoc(docRef, dataToSave);
    } else {
      await setDoc(docRef, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
    }

    return docId;
  } catch (error) {
    console.error("Error guardando cargo calculado:", error);
    throw error;
  }
}

/**
 * Actualiza un cargo calculado existente
 */
export async function updateCargoCalculado(
  año: number,
  cargo: CargoTipo,
  data: Partial<Omit<CargoCalculado, "id" | "año" | "cargo" | "createdAt">>
): Promise<void> {
  try {
    const docId = `${año}`;
    const docRef = doc(db, COLLECTIONS.CARGOS_CALCULADOS, docId);
    
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error actualizando cargo calculado:", error);
    throw error;
  }
}

/**
 * Elimina un cargo calculado
 */
export async function deleteCargoCalculado(año: number, cargo: CargoTipo): Promise<void> {
  try {
    const docId = `${año}_${cargo}`;
    await deleteDoc(doc(db, COLLECTIONS.CARGOS_CALCULADOS, docId));
  } catch (error) {
    console.error("Error eliminando cargo calculado:", error);
    throw error;
  }
}

/**
 * Genera y guarda todos los cargos calculados basándose en la configuración de salarios
 * 
 * IMPORTANTE: Los cálculos aplican el multiplicador AL FINAL
 * Proceso:
 * 1. Para cada cargo (Auxiliar, Técnico, Tecnólogo, Profesional, etc.)
 * 2. Calcula: base + auxilio + costos + ganancia + IVA = total calculado
 * 3. Multiplica el total por el factor del cargo (1x, 2x, 3x, 4x, 5x, 7x)
 * 4. Guarda los resultados en Firestore
 */
export async function generarCargosCalculados(
  config: SalarioConfig
): Promise<{ success: boolean; cargosCreados: number; errores: string[] }> {
  const errores: string[] = [];
  let cargosCreados = 0;

  try {
    // Importar funciones de cálculo (contienen la lógica del multiplicador al final)
    const { calcularSalarioMensual, calcularSalarioPorHora } = await import("./salarios");

    // Generar cálculos para cada cargo (Auxiliar=1x, Técnico=2x, etc.)
    for (const [cargoNombre, multiplicador] of Object.entries(CARGO_MULTIPLICADORES)) {
      try {
        const cargo = cargoNombre as CargoTipo;
        
        // Calcular valores (multiplicador se aplica dentro de estas funciones AL FINAL)
        const mensual = calcularSalarioMensual(config, cargo);
        const porHora = calcularSalarioPorHora(config, mensual);

        // Crear objeto CargoCalculado
        // NOTA: totalMensual y totalPorHora YA incluyen el multiplicador aplicado
        const cargoCalculado: Omit<CargoCalculado, "id" | "createdAt" | "updatedAt"> = {
          año: config.año,
          cargo,
          multiplicador, // Factor aplicado (1x, 2x, 3x, 4x, 5x, 7x)
          
          // Valores mensuales (base SIN multiplicador, excepto totalMensual)
          salarioBaseCargo: mensual.salarioBaseCargo, // Base fijo (1,423,500)
          auxilioTransporte: mensual.auxilioTransporte, // Auxilio si aplica
          salarioBruto: mensual.salarioBruto, // base + auxilio
          costoEmpresa: mensual.costoEmpresa, // × factor costo empleado
          gananciaValor: mensual.gananciaValor, // × % ganancia
          subtotalMensual: mensual.subtotal, // costo + ganancia
          ivaMensual: mensual.ivaValor, // × % IVA
          totalMensual: mensual.totalMensual, // ← INCLUYE multiplicador
          
          // Valores por hora (calculados desde mensuales)
          horasLegales: porHora.horasLegales,
          salarioHoraBase: porHora.salarioHoraBase,
          costoHoraEmpresa: porHora.costoHoraEmpresa,
          gananciaHora: porHora.gananciaHora,
          ivaHora: porHora.ivaHora,
          totalPorHora: porHora.totalPorHora, // ← INCLUYE multiplicador
          
          activo: true,
        };

        // Guardar en Firestore
        await saveCargoCalculado(cargoCalculado);
        cargosCreados++;
      } catch (error) {
        const mensaje = `Error procesando cargo ${cargoNombre}: ${error instanceof Error ? error.message : "Error desconocido"}`;
        errores.push(mensaje);
        console.error(mensaje);
      }
    }

    return {
      success: errores.length === 0,
      cargosCreados,
      errores,
    };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido al generar cargos";
    errores.push(mensaje);
    return {
      success: false,
      cargosCreados,
      errores,
    };
  }
}

/**
 * Recalcula todos los cargos para un año específico basándose en la configuración
 */
export async function recalcularCargosParaAño(año: number): Promise<{
  success: boolean;
  message: string;
  cargosActualizados: number;
}> {
  try {
    // Obtener configuración del año
    const config = await getSalarioConfig(año);
    
    if (!config) {
      return {
        success: false,
        message: `No existe configuración de salario para el año ${año}`,
        cargosActualizados: 0,
      };
    }

    // Generar cargos calculados
    const resultado = await generarCargosCalculados(config);

    return {
      success: resultado.success,
      message: resultado.success 
        ? `Se recalcularon ${resultado.cargosCreados} cargos exitosamente`
        : `Se recalcularon ${resultado.cargosCreados} cargos con ${resultado.errores.length} errores`,
      cargosActualizados: resultado.cargosCreados,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al recalcular cargos",
      cargosActualizados: 0,
    };
  }
}

// ===== INICIALIZACIÓN DE DATOS =====

/**
 * Inicializa los datos por defecto en Firestore
 */
export async function initializeFirestoreData(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, string>;
}> {
  const results: Record<string, string> = {};

  try {
    // 1. Verificar/crear configuración de salarios para 2025
    const existingConfig = await getSalarioConfig(2025);
    if (!existingConfig) {
      await saveSalarioConfig(DEFAULT_SALARIO_CONFIG);
      results.salarioConfig = "Creada configuración de salarios 2025";
    } else {
      results.salarioConfig = "Configuración de salarios 2025 ya existe";
    }

    // 2. Verificar/crear cargos
    const existingCargos = await getCargos();
    if (existingCargos.length === 0) {
      for (const [nombre, multiplicador] of Object.entries(CARGO_MULTIPLICADORES)) {
        await saveCargo({
          nombre: nombre as CargoTipo,
          multiplicador,
          activo: true,
        });
      }
      results.cargos = `Creados ${Object.keys(CARGO_MULTIPLICADORES).length} cargos`;
    } else {
      results.cargos = `Ya existen ${existingCargos.length} cargos`;
    }

    // 3. Crear servicios de ejemplo si no existen
    const existingServicios = await getServicios();
    if (existingServicios.length === 0) {
      const serviciosEjemplo: Omit<Servicio, "id" | "createdAt" | "updatedAt">[] = [
        {
          nombre: "Desarrollo Web Frontend",
          descripcion: "Desarrollo de interfaces de usuario con React/Next.js",
          categoria: "Desarrollo",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          activo: true,
        },
        {
          nombre: "Desarrollo Web Backend",
          descripcion: "Desarrollo de APIs y servicios con Node.js",
          categoria: "Desarrollo",
          cargosSugeridos: ["Profesional", "Especialista"],
          activo: true,
        },
        {
          nombre: "Diseño UI/UX",
          descripcion: "Diseño de interfaces y experiencia de usuario",
          categoria: "Diseño",
          cargosSugeridos: ["Técnico", "Tecnólogo"],
          activo: true,
        },
        {
          nombre: "Desarrollo de Websites Corporativos e Ecommerce",
          descripcion: "Creación de sitios web corporativos y tiendas en línea",
          categoria: "Desarrollo",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          activo: true,
        },
        {
          nombre: "Desarrollo de Aplicaciones Móviles",
          descripcion: "Desarrollo de apps móviles para iOS y Android",
          categoria: "Desarrollo",
          cargosSugeridos: ["Profesional", "Especialista"],
          activo: true,
        },
        {
          nombre: "Consultoría Arquitectura y Reingeniería de Software",
          descripcion: "Asesoría y consultoría en arquitectura de software",
          categoria: "Gestión",
          cargosSugeridos: ["Master"],
          activo: true,
        },
        {
          nombre: "Gestión de Proyectos",
          descripcion: "Planificación y gestión de proyectos ágiles",
          categoria: "Gestión",
          cargosSugeridos: ["Especialista", "Master"],
          activo: true,
        },
        {
          nombre: "Pruebas y QA",
          descripcion: "Pruebas de software y aseguramiento de calidad",
          categoria: "Calidad",
          cargosSugeridos: ["Técnico", "Tecnólogo"],
          activo: true,
        },
        {
          nombre: "Implementador de Soluciones",
          descripcion: "Implementación y configuración de soluciones empresariales",
          categoria: "Implementación",
          cargosSugeridos: ["Profesional"],
          activo: true,
        },
        {
          nombre: "Implmentación de Automatizaciones",
          descripcion: "Desarrollo e implementación de automatizaciones de procesos",
          categoria: "Automatización",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          activo: true,
        },
        {
          nombre: "Scrum Master",
          descripcion: "Facilitación de equipos ágiles como Scrum Master",
          categoria: "Gestión",
          cargosSugeridos: ["Especialista"],
          activo: true,
        },
        {
          nombre: "Product Owner",
          descripcion: "Gestión de productos y backlog como Product Owner",
          categoria: "Gestión",
          cargosSugeridos: ["Especialista"],
          activo: true,
        },
        {
          nombre: "DevOps",
          descripcion: "Implementación de prácticas DevOps y CI/CD",
          categoria: "DevOps",
          cargosSugeridos: ["Profesional", "Especialista"],
          activo: true,
        },
        {
          nombre: "Administrador de Bases de Datos",
          descripcion: "Gestión y mantenimiento de bases de datos",
          categoria: "Gestión",
          cargosSugeridos: ["Profesional"],
          activo: true,
        },
        {
          nombre: "Soporte Técnico",
          descripcion: "Soporte y mantenimiento de aplicaciones",
          categoria: "Soporte",
          cargosSugeridos: ["Técnico"],
          activo: true,
        },
      ];

      for (const servicio of serviciosEjemplo) {
        await saveServicio(servicio);
      }
      results.servicios = `Creados ${serviciosEjemplo.length} servicios de ejemplo`;
    } else {
      results.servicios = `Ya existen ${existingServicios.length} servicios`;
    }

    // 4. Inicializar divisa USD/COP
    try {
      await updateExchangeRate();
      results.divisa = "Divisa USD/COP inicializada correctamente";
    } catch (divisaError) {
      console.warn("Error inicializando divisa:", divisaError);
      results.divisa = "Error al inicializar divisa (continuando con otros datos)";
    }

    return {
      success: true,
      message: "Datos inicializados correctamente",
      details: results,
    };
  } catch (error) {
    console.error("Error inicializando datos:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
      details: results,
    };
  }
}

/**
 * Verifica la conexión a Firestore
 */
export async function checkFirestoreConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    // Intentar leer una colección para verificar conexión
    const testQuery = query(collection(db, COLLECTIONS.SALARIO_CONFIGS), limit(1));
    await getDocs(testQuery);
    return {
      connected: true,
      message: "Conexión a Firestore exitosa",
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Error de conexión desconocido",
    };
  }
}

export { COLLECTIONS };
