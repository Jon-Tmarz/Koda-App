// Tipos para el sistema de cálculo de talento humano

// Multiplicadores por cargo
export const CARGO_MULTIPLICADORES = {
  Auxiliar: 1,
  Técnico: 2,
  Tecnólogo: 3,
  Profesional: 4,
  Especialista: 5,
  Master: 7,
} as const;

export type CargoTipo = keyof typeof CARGO_MULTIPLICADORES;

export const CARGOS_LIST: CargoTipo[] = [
  "Auxiliar",
  "Técnico",
  "Tecnólogo",
  "Profesional",
  "Especialista",
  "Master",
];

// Configuración base de salarios (se guarda en Firestore)
export interface SalarioConfig {
  id?: string;
  año: number;
  salarioBase: number; // SMMLV Colombia
  auxilioTransporte: number;
  horasLegales: number; // Horas laborales mensuales (generalmente 192)
  iva: number; // Porcentaje de IVA (ej: 19)
  ganancia: number; // Porcentaje de ganancia empresa (ej: 30)
  costoEmpleado: number; // Factor de costo empleado para la empresa (ej: 1.5 = 50% adicional)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Desglose de salario mensual por cargo
 * 
 * IMPORTANTE - LÓGICA DE MULTIPLICADOR:
 * El multiplicador se aplica AL FINAL sobre el total calculado.
 * Pasos:
 * 1. salarioBaseCargo = salarioBase (FIJO, no se multiplica)
 * 2. + auxilioTransporte
 * 3. = salarioBruto
 * 4. × costoEmpleado
 * 5. = costoEmpresa
 * 6. + ganancia%
 * 7. = subtotal
 * 8. + IVA%
 * 9. = totalCalculado
 * 10. × multiplicador (1x, 2x, 3x, 4x, 5x, 7x) ← AQUÍ
 * 11. = totalMensual
 */
export interface SalarioMensual {
  cargo: CargoTipo;
  multiplicador: number; // Se aplica AL FINAL
  salarioBaseCargo: number; // Salario base FIJO (NO multiplicado)
  auxilioTransporte: number; // Auxilio de transporte (si aplica)
  salarioBruto: number; // salarioBaseCargo + auxilioTransporte
  costoEmpresa: number; // salarioBruto × costoEmpleado
  gananciaValor: number; // costoEmpresa × ganancia%
  subtotal: number; // costoEmpresa + gananciaValor
  ivaValor: number; // subtotal × iva%
  totalMensual: number; // (subtotal + ivaValor) × multiplicador ← INCLUYE multiplicador
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

// Valores por defecto para Colombia 2025
export const DEFAULT_SALARIO_CONFIG: Omit<SalarioConfig, "id" | "createdAt" | "updatedAt"> = {
  año: 2025,
  salarioBase: 1423500, // SMMLV Colombia 2025 aproximado
  auxilioTransporte: 200000, // Auxilio de transporte 2025 aproximado
  horasLegales: 192, // 8 horas * 24 días laborales
  iva: 19, // IVA Colombia
  ganancia: 30, // 30% de ganancia
  costoEmpleado: 1.5, // Factor de costo (prestaciones, seguridad social, etc.)
};

// Recargos según normativa laboral colombiana
export const RECARGOS_LABORALES = {
  HORA_EXTRA_DIURNA: 0.25,        // 25% adicional
  HORA_EXTRA_NOCTURNA: 0.75,      // 75% adicional
  RECARGO_NOCTURNO: 0.35,         // 35% adicional
  DOMINICAL_FESTIVO: 0.75,        // 75% adicional
} as const;