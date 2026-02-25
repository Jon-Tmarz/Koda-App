// Tipos de datos para Firestore
export interface Servicio {
  id?: string;
  nombre: string;
  categoria: string;
  tecnologias: string[]; // Stack completo: lenguajes, frameworks, herramientas, servicios
  cargosSugeridos?: string[]; // Opcional: cargos sugeridos para este servicio
  disponible: boolean;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const CATEGORIAS_HERRAMIENTA = ["Software", "infraestructura", "Plataforma", "Servicio", "otro"] as const;
export const TIPOS_COBRANZA = ["mensual", "anual", "uso", "unico"] as const;
export const DIVISAS = ["USD", "COP"] as const;

// Generado dinámicamente a partir de CATEGORIAS_HERRAMIENTA para evitar redundancia.
export const CATEGORIA_LABELS = Object.fromEntries(
  CATEGORIAS_HERRAMIENTA.map(cat => [cat, cat.charAt(0).toUpperCase() + cat.slice(1)])
) as Record<typeof CATEGORIAS_HERRAMIENTA[number], string>;

export const TIPO_COBRANZA_LABELS= Object.fromEntries(
  TIPOS_COBRANZA.map(typ => [typ, typ.charAt(0).toUpperCase() + typ.slice(1)])
) as Record<typeof TIPOS_COBRANZA[number], string>;

export interface Herramienta {
  id?: string;
  nombre: string;
  categoria: typeof CATEGORIAS_HERRAMIENTA[number];
  tipoCobranza: typeof TIPOS_COBRANZA[number];
  costo: number;
  descripcion?: string;
  proveedor?: string;
  disponible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  divisa: typeof DIVISAS[number];
}

// Inteface para los datos de creación de una cotización, sin campos generados automáticamente
interface QuoteItem {
  descripcion: string;
  horas: number;
  costoPorHora: number;
  subtotal: number;
}

export interface Quote {
  id?: string;
  numero: string;
  clienteId: string;
  clienteNombre: string;
  items: QuoteItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  pdfUrl?: string;
  fecha: Date;
  aprobacionNotas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para los datos de creación de Leads, sin campos generados automáticamente
export interface Lead {
  id?: string;
  contacto: string;
  empresa: string;
  email: string;
  telefono?: string;
  estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeadEstado = Lead["estado"];

export interface ColaboradorAsignado {
  nombre: string;
  cargo: string; // Debería ser CargoTipo, pero lo mantenemos simple por ahora
  horasAsignadas?: number;
}

// Inteface para los datos de creación de un cotizaciones en Enpoint, sin campos generados automáticamente (Se requiere unificar con Quote)
export interface CotizacionItem {
  descripcion: string;
  colaboradores?: ColaboradorAsignado[];
  horas: number;
  costoPorHora: number;
  subtotal: number;
}

export interface NotaCotizacion {
  texto: string;
  fecha: Date;
  autor?: string;
}

export interface Cotizacion {
  id?: string;
  leadId?: string;
  numero: string;
  fecha: Date;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  tiempoEstimado?: number;
  subtotalNegociado?: number;
  totalNegociado?: number;
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  pdfUrl?: string;
  notas?: NotaCotizacion[];
  createdAt?: Date;
  updatedAt?: Date;
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
  timestamp: Date; // Firestore Timestamp
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
