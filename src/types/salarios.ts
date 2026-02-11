// Tipos para el sistema de cálculo de talento humano

// Multiplicadores por cargo
export const CARGO_MULTIPLICADORES = {
  Auxiliar: 1,
  Técnico: 1.75,
  Tecnólogo: 2.5,
  Profesional: 3.25,
  Especialista: 4,
  Master: 4.75,
} as const;

export type CargoTipo = keyof typeof CARGO_MULTIPLICADORES;

export const CARGOS_LIST: CargoTipo[] = [ "Auxiliar", "Técnico", "Tecnólogo", "Profesional", "Especialista", "Master"];

// Configuración base de salarios (se guarda en Firestore)
export interface SalarioConfig {
  id?: string;
  año: number;
  salarioBase: number; // SMMLV Colombia
  auxilioTransporte: number;
  horasLegales: number; // Horas laborales mensuales
  iva: number; // Porcentaje de IVA (ej: 19)
  ganancia: number; // Porcentaje de ganancia empresa (ej: 30)
  costoEmpleado: number; // Porcentaje de carga prestacional (ej: 48.3)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Desglose de salario mensual por cargo
 * 
 * NUEVA LÓGICA DE CÁLCULO (2026):
 * 1. salarioBaseCargo = config.salarioBase * multiplicador
 * 2. costoAdicional = salarioBaseCargo * (config.costoEmpleado / 100)
 * 3. totalCostoEmpresa = salarioBaseCargo + costoAdicional
 * 4. gananciaValor = salarioBaseCargo * (config.ganancia / 100)
 * 5. subtotal = totalCostoEmpresa + gananciaValor + (auxilioTransporte si aplica)
 * 6. totalMensual = subtotal * (1 + config.iva / 100)
 * 
 * * Auxilio de transporte aplica si salarioBaseCargo <= config.salarioBase * 2
 */
export interface SalarioMensual {
  cargo: CargoTipo;
  multiplicador: number; // Se aplica AL FINAL
  salarioBaseCargo: number; // Salario base FIJO (NO multiplicado)
  auxilioTransporte: number; // Auxilio de transporte (si aplica)
  salarioBruto: number; // salarioBaseCargo + auxilioTransporte
  
  // Deducciones del Empleado (Colombia 2026)
  saludEmpleado: number; // 4% del salarioBaseCargo
  pensionEmpleado: number; // 4% del salarioBaseCargo
  fondoSolidaridad: number; // 1-2% si salarioBaseCargo > 4 SMMLV
  totalDeducciones: number;
  salarioNeto: number; // salarioBaseCargo - totalDeducciones
  
  costoEmpresa: number; // salarioBaseCargo × 48.3% (Carga prestacional)
  costoLaboralTotal: number; // salarioBaseCargo + costoEmpresa
  gananciaValor: number; // salarioBaseCargo × ganancia%
  subtotal: number; // costoLaboralTotal + gananciaValor + auxilioTransporte
  ivaValor: number; // subtotal × iva%
  totalMensual: number; // (subtotal + ivaValor) ← INCLUYE todo
}

/**
 * Desglose de salario por hora
 * 
 * NOTA: totalPorHora se calcula dividiendo totalMensual (que YA incluye
 * el multiplicador aplicado) entre las horas legales.
 */
export interface SalarioPorHora {
  cargo: CargoTipo;
  horasLegales: number;
  salarioHoraBase: number; // salarioBaseCargo / horasLegales
  costoHoraEmpresa: number; // costoEmpresa / horasLegales
  gananciaHora: number; // gananciaValor / horasLegales
  ivaHora: number; // ivaValor / horasLegales
  totalPorHora: number; // totalMensual / horasLegales (incluye multiplicador)
}

// Resultado completo de consulta de salario
export interface ConsultaSalario {
  config: SalarioConfig;
  mensual: SalarioMensual;
  porHora: SalarioPorHora;
}

// Valores por defecto para Colombia 2026
export const DEFAULT_SALARIO_CONFIG: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt"> = {
  año: 2026,
  salarioBase: 1750905, // SMMLV Colombia 2026
  auxilioTransporte: 249095, // Auxilio de transporte 2026
  horasLegales: 182, // Horas laborales mensuales 182
  iva: 19, // IVA Colombia
  ganancia: 30, // 30% de ganancia
  costoEmpleado: 48.3, // 48.3% de carga prestacional adicional
};

// Recargos según normativa laboral colombiana
export const RECARGOS_LABORALES = {
  HORA_EXTRA_DIURNA: 0.25,        // 25% adicional
  HORA_EXTRA_NOCTURNA: 0.75,      // 75% adicional
  RECARGO_NOCTURNO: 0.35,         // 35% adicional
  DOMINICAL_FESTIVO: 0.75,        // 75% adicional
} as const;