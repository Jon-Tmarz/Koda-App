// Tipos de datos para Firestore
export interface Servicio {
  id?: string;
  nombre: string;
  categoria: string;
  tecnologias: string[];  // Stack completo: lenguajes, frameworks, herramientas, servicios
  descripcion?: string;
  disponible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Herramienta {
  id?: string;
  nombre: string;
  categoria: "licencia" | "infraestructura" | "herramienta" | "otro";
  tipoCobranza: "mensual" | "anual" | "uso" | "unico";
  costo: number;
  descripcion?: string;
  proveedor?: string;
  disponible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Lead {
  id?: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
  notas?: string;
  fechaCreacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cotizacion {
  id?: string;
  cliente: string;
  servicios: string[];
  total: number;
  iva: number;
  subtotal: number;
  fecha: Date;
  pdfUrl?: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
}

export interface ConfiguracionGlobal {
  moneda: string;
  iva: number;
  empresa: string;
  logo?: string;
}

export interface APIKey {
  id?: string;
  nombre: string;
  key: string;
  descripcion?: string;
  activa: boolean;
  ultimoUso?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExchangeRate {
  id?: string;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  timestamp: any; // Firestore Timestamp
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  rol: "admin" | "user";
  nombre: string;
  ultimoAcceso?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Re-exportar tipos de salarios
export * from "./salarios";
