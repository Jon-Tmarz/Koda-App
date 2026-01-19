// Lógica de cálculo de costos de talento humano
import type {
  SalarioConfig,
  SalarioMensual,
  SalarioPorHora,
  CargoTipo,
} from "@/types/salarios";
import { CARGO_MULTIPLICADORES } from "@/types/salarios";
import { TASAS_RECARGO } from "tributos-co";

// Re-exportar tipos para uso en componentes
export type { SalarioConfig, SalarioMensual, SalarioPorHora, CargoTipo };
export { CARGO_MULTIPLICADORES };

// Re-exportar funciones de tributos-co para uso en otros módulos
export { calcularHoraOrdinaria, calcularHoraExtraDiurna, calcularHoraExtraNocturna, calcularHoraOrdinariaNocturna, calcularHoraDominicalFestiva, calcularHoraExtraDiurnaDominical, calcularHoraExtraNocturnaDominical, TASAS_RECARGO } from "tributos-co";

// Tipo para consulta completa
export interface ConsultaSalario {
  config: SalarioConfig;
  mensual: SalarioMensual;
  porHora: SalarioPorHora;
}

/**
 * Calcula el desglose de salario mensual para un cargo específico
 * 
 * LÓGICA IMPORTANTE - MULTIPLICADOR AL FINAL:
 * 1. Toma salarioBase fijo (ej: 1,423,500) - NO se multiplica aquí
 * 2. + auxilioTransporte (si aplica)
 * 3. = salarioBruto
 * 4. × costoEmpleado (prestaciones, seguridad social)
 * 5. = costoEmpresa
 * 6. + ganancia (% de margen)
 * 7. = subtotal
 * 8. + IVA
 * 9. = totalCalculado
 * 10. × MULTIPLICADOR del cargo (1x, 2x, 3x, 4x, 5x, 7x) ← SE APLICA AQUÍ
 * 11. = totalMensual
 * 
 * Esto asegura que todos los costos estén incluidos ANTES del multiplicador.
 */
export function calcularSalarioMensual(
  config: SalarioConfig,
  cargo: CargoTipo
): SalarioMensual {
  const multiplicador = CARGO_MULTIPLICADORES[cargo];
  
  // 1. Salario base FIJO (NO multiplicado)
  const salarioBaseCargo = config.salarioBase;
  
  // 2. Auxilio de transporte (aplica si el salario bruto <= 2 SMMLV)
  // Se evalúa ANTES de aplicar el multiplicador
  const auxilioTransporte = salarioBaseCargo <= config.salarioBase * 2 
    ? config.auxilioTransporte 
    : 0;
  
  // 3. Salario bruto = base + auxilio
  const salarioBruto = salarioBaseCargo + auxilioTransporte;
  
  // 4. Costo empresa = bruto × factor costo empleado (prestaciones, seguridad social)
  const costoEmpresa = salarioBruto * config.costoEmpleado;
  
  // 5. Ganancia empresa = costo × % ganancia
  const gananciaValor = costoEmpresa * (config.ganancia / 100);
  
  // 6. Subtotal = costo + ganancia
  const subtotal = costoEmpresa + gananciaValor;
  
  // 7. IVA = subtotal × % IVA
  const ivaValor = subtotal * (config.iva / 100);
  
  // 8. Total calculado = subtotal + IVA
  const totalCalculado = subtotal + ivaValor;
  
  // 9. MULTIPLICADOR AL FINAL = totalCalculado × multiplicador del cargo
  const totalMensual = totalCalculado * multiplicador;

  return {
    cargo,
    multiplicador,
    salarioBaseCargo,
    auxilioTransporte,
    salarioBruto,
    costoEmpresa,
    gananciaValor,
    subtotal,
    ivaValor,
    totalMensual,
  };
}

/**
 * Calcula el desglose de salario por hora para un cargo específico
 * 
 * NOTA: El totalMensual recibido YA incluye el multiplicador aplicado al final
 */
export function calcularSalarioPorHora(
  config: SalarioConfig,
  salarioMensual: SalarioMensual
): SalarioPorHora {
  const horasLegales = config.horasLegales;
  
  // Cálculos por hora (dividen los valores mensuales)
  const salarioHoraBase = salarioMensual.salarioBaseCargo / horasLegales;
  const costoHoraEmpresa = salarioMensual.costoEmpresa / horasLegales;
  const gananciaHora = salarioMensual.gananciaValor / horasLegales;
  const ivaHora = salarioMensual.ivaValor / horasLegales;
  
  // Total por hora (incluye el multiplicador ya aplicado en totalMensual)
  const totalPorHora = salarioMensual.totalMensual / horasLegales;

  return {
    cargo: salarioMensual.cargo,
    horasLegales,
    salarioHoraBase,
    costoHoraEmpresa,
    gananciaHora,
    ivaHora,
    totalPorHora,
  };
}

/**
 * Calcula el salario completo (mensual y por hora) para un cargo
 */
export function calcularSalarioCompleto(
  config: SalarioConfig,
  cargo: CargoTipo
): ConsultaSalario {
  const mensual = calcularSalarioMensual(config, cargo);
  const porHora = calcularSalarioPorHora(config, mensual);

  return {
    config,
    mensual,
    porHora,
  };
}

/**
 * Calcula todos los salarios para todos los cargos
 */
export function calcularTodosLosSalarios(
  config: SalarioConfig
): ConsultaSalario[] {
  const cargos: CargoTipo[] = [
    "Auxiliar",
    "Técnico",
    "Tecnólogo",
    "Profesional",
    "Especialista",
    "Master",
  ];

  return cargos.map((cargo) => calcularSalarioCompleto(config, cargo));
}

/**
 * Formatea un valor numérico como moneda colombiana
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Calcula el costo de un proyecto basado en horas y cargo
 */
export function calcularCostoProyecto(
  config: SalarioConfig,
  cargo: CargoTipo,
  horas: number
): {
  cargo: CargoTipo;
  horas: number;
  costoPorHora: number;
  subtotal: number;
  iva: number;
  total: number;
} {
  const salario = calcularSalarioCompleto(config, cargo);
  const costoPorHora = salario.porHora.totalPorHora;
  const subtotal = costoPorHora * horas;
  const iva = subtotal * (config.iva / 100);
  const total = subtotal + iva;

  return {
    cargo,
    horas,
    costoPorHora,
    subtotal,
    iva,
    total,
  };
}

/**
 * Calcula el incremento porcentual entre dos años
 */
export function calcularIncremento(
  salarioAnterior: number,
  salarioActual: number
): number {
  if (salarioAnterior === 0) return 0;
  return ((salarioActual - salarioAnterior) / salarioAnterior) * 100;
}

// ===== CÁLCULOS DE HORAS EXTRAS Y RECARGOS (NORMATIVA LABORAL COLOMBIANA) =====

/**
 * Tipos de horas especiales (usando tributos-co)
 */
export type TipoHoraEspecial = 
  | "extraDiurna" 
  | "extraNocturna" 
  | "recargoNocturno" 
  | "dominicalFestivo"
  | "extraDiurnaDominical"
  | "extraNocturnaDominical";

/**
 * Interface para desglose de horas extras y recargos
 * Actualizado para usar tributos-co con los recargos de la normativa 2026
 */
export interface HorasExtrasRecargos {
  // Valor base por hora (sin recargos)
  valorHoraBase: number;
  
  // Horas extras diurnas (6am - 9pm) +25%
  horaExtraDiurna: {
    recargo: number;
    valorPorHora: number;
  };
  
  // Horas extras nocturnas (9pm - 6am) +75%
  horaExtraNocturna: {
    recargo: number;
    valorPorHora: number;
  };
  
  // Recargo nocturno (hora ordinaria nocturna) +35%
  recargoNocturno: {
    recargo: number;
    valorPorHora: number;
  };
  
  // Hora dominical o festivo +80%
  dominicalFestivo: {
    recargo: number;
    valorPorHora: number;
  };

  // Hora extra diurna dominical +105%
  extraDiurnaDominical: {
    recargo: number;
    valorPorHora: number;
  };

  // Hora extra nocturna dominical +155%
  extraNocturnaDominical: {
    recargo: number;
    valorPorHora: number;
  };
}

/**
 * Calcula el valor de una hora con recargo específico usando tributos-co
 * 
 * @param valorHoraBase - Valor de la hora ordinaria sin recargos
 * @param tipoHora - Tipo de hora especial a calcular
 * @returns Valor de la hora con el recargo aplicado
 */
export function calcularHoraConRecargo(
  valorHoraBase: number,
  tipoHora: TipoHoraEspecial
): number {
  const recargos = {
    extraDiurna: TASAS_RECARGO.EXTRA_DIURNA,
    extraNocturna: TASAS_RECARGO.EXTRA_NOCTURNA,
    recargoNocturno: TASAS_RECARGO.RECARGO_NOCTURNO,
    dominicalFestivo: TASAS_RECARGO.DOMINICAL_FESTIVO,
    extraDiurnaDominical: TASAS_RECARGO.EXTRA_DIURNA_DOMINICAL,
    extraNocturnaDominical: TASAS_RECARGO.EXTRA_NOCTURNA_DOMINICAL,
  };
  
  const recargo = recargos[tipoHora];
  return valorHoraBase * (1 + recargo);
}

/**
 * Calcula todos los tipos de horas extras y recargos para un cargo usando tributos-co
 * 
 * IMPORTANTE: Esta función usa tributos-co para obtener los recargos según la normativa
 * laboral colombiana actualizada 2026. El valor base ya incluye todos los costos empresariales.
 * 
 * Los recargos se aplican sobre el valor total por hora (que ya incluye multiplicador, 
 * prestaciones, ganancia e IVA).
 */
export function calcularHorasExtrasYRecargos(
  salarioPorHora: SalarioPorHora
): HorasExtrasRecargos {
  const valorHoraBase = salarioPorHora.totalPorHora;
  
  return {
    valorHoraBase,
    
    horaExtraDiurna: {
      recargo: TASAS_RECARGO.EXTRA_DIURNA,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.EXTRA_DIURNA),
    },
    
    horaExtraNocturna: {
      recargo: TASAS_RECARGO.EXTRA_NOCTURNA,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.EXTRA_NOCTURNA),
    },
    
    recargoNocturno: {
      recargo: TASAS_RECARGO.RECARGO_NOCTURNO,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.RECARGO_NOCTURNO),
    },
    
    dominicalFestivo: {
      recargo: TASAS_RECARGO.DOMINICAL_FESTIVO,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.DOMINICAL_FESTIVO),
    },

    extraDiurnaDominical: {
      recargo: TASAS_RECARGO.EXTRA_DIURNA_DOMINICAL,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.EXTRA_DIURNA_DOMINICAL),
    },

    extraNocturnaDominical: {
      recargo: TASAS_RECARGO.EXTRA_NOCTURNA_DOMINICAL,
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.EXTRA_NOCTURNA_DOMINICAL),
    },
  };
}

/**
 * Calcula el costo de un proyecto incluyendo horas extras y recargos
 * Actualizado para usar tributos-co con todos los tipos de recargos
 * 
 * @param config - Configuración de salarios
 * @param cargo - Tipo de cargo
 * @param horasOrdinarias - Horas normales de trabajo
 * @param horasExtras - Desglose de horas extras por tipo
 */
export function calcularCostoProyectoConExtras(
  config: SalarioConfig,
  cargo: CargoTipo,
  horasOrdinarias: number,
  horasExtras?: {
    extrasDiurnas?: number;
    extrasNocturnas?: number;
    nocturnas?: number;
    dominicalesFestivos?: number;
    extrasDiurnasDominicales?: number;
    extrasNocturnasDominicales?: number;
  }
): {
  cargo: CargoTipo;
  horasOrdinarias: number;
  costoPorHoraOrdinaria: number;
  subtotalOrdinarias: number;
  
  horasExtras?: {
    extrasDiurnas: { horas: number; valorHora: number; subtotal: number };
    extrasNocturnas: { horas: number; valorHora: number; subtotal: number };
    nocturnas: { horas: number; valorHora: number; subtotal: number };
    dominicalesFestivos: { horas: number; valorHora: number; subtotal: number };
    extrasDiurnasDominicales: { horas: number; valorHora: number; subtotal: number };
    extrasNocturnasDominicales: { horas: number; valorHora: number; subtotal: number };
  };
  
  subtotalHorasExtras: number;
  subtotalTotal: number;
  iva: number;
  total: number;
} {
  const salario = calcularSalarioCompleto(config, cargo);
  const horasRecargos = calcularHorasExtrasYRecargos(salario.porHora);
  
  // Costo de horas ordinarias
  const costoPorHoraOrdinaria = salario.porHora.totalPorHora;
  const subtotalOrdinarias = costoPorHoraOrdinaria * horasOrdinarias;
  
  // Calcular horas extras si existen
  let subtotalHorasExtras = 0;
  let detalleHorasExtras;
  
  if (horasExtras) {
    const extrasDiurnas = horasExtras.extrasDiurnas || 0;
    const extrasNocturnas = horasExtras.extrasNocturnas || 0;
    const nocturnas = horasExtras.nocturnas || 0;
    const dominicalesFestivos = horasExtras.dominicalesFestivos || 0;
    const extrasDiurnasDominicales = horasExtras.extrasDiurnasDominicales || 0;
    const extrasNocturnasDominicales = horasExtras.extrasNocturnasDominicales || 0;
    
    const subtotalExtrasDiurnas = extrasDiurnas * horasRecargos.horaExtraDiurna.valorPorHora;
    const subtotalExtrasNocturnas = extrasNocturnas * horasRecargos.horaExtraNocturna.valorPorHora;
    const subtotalNocturnas = nocturnas * horasRecargos.recargoNocturno.valorPorHora;
    const subtotalDominicales = dominicalesFestivos * horasRecargos.dominicalFestivo.valorPorHora;
    const subtotalExtrasDiurnasDominicales = extrasDiurnasDominicales * horasRecargos.extraDiurnaDominical.valorPorHora;
    const subtotalExtrasNocturnasDominicales = extrasNocturnasDominicales * horasRecargos.extraNocturnaDominical.valorPorHora;
    
    subtotalHorasExtras = 
      subtotalExtrasDiurnas + 
      subtotalExtrasNocturnas + 
      subtotalNocturnas + 
      subtotalDominicales +
      subtotalExtrasDiurnasDominicales +
      subtotalExtrasNocturnasDominicales;
    
    detalleHorasExtras = {
      extrasDiurnas: {
        horas: extrasDiurnas,
        valorHora: horasRecargos.horaExtraDiurna.valorPorHora,
        subtotal: subtotalExtrasDiurnas,
      },
      extrasNocturnas: {
        horas: extrasNocturnas,
        valorHora: horasRecargos.horaExtraNocturna.valorPorHora,
        subtotal: subtotalExtrasNocturnas,
      },
      nocturnas: {
        horas: nocturnas,
        valorHora: horasRecargos.recargoNocturno.valorPorHora,
        subtotal: subtotalNocturnas,
      },
      dominicalesFestivos: {
        horas: dominicalesFestivos,
        valorHora: horasRecargos.dominicalFestivo.valorPorHora,
        subtotal: subtotalDominicales,
      },
      extrasDiurnasDominicales: {
        horas: extrasDiurnasDominicales,
        valorHora: horasRecargos.extraDiurnaDominical.valorPorHora,
        subtotal: subtotalExtrasDiurnasDominicales,
      },
      extrasNocturnasDominicales: {
        horas: extrasNocturnasDominicales,
        valorHora: horasRecargos.extraNocturnaDominical.valorPorHora,
        subtotal: subtotalExtrasNocturnasDominicales,
      },
    };
  }
  
  const subtotalTotal = subtotalOrdinarias + subtotalHorasExtras;
  const iva = subtotalTotal * (config.iva / 100);
  const total = subtotalTotal + iva;
  
  return {
    cargo,
    horasOrdinarias,
    costoPorHoraOrdinaria,
    subtotalOrdinarias,
    horasExtras: detalleHorasExtras,
    subtotalHorasExtras,
    subtotalTotal,
    iva,
    total,
  };
}
