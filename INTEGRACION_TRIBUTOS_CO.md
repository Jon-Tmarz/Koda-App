# Integración de tributos-co

Se ha integrado exitosamente el paquete npm [`tributos-co`](https://www.npmjs.com/package/tributos-co) para el cálculo de recargos salariales según la normativa laboral colombiana.

## ¿Qué es tributos-co?

Es un paquete TypeScript que calcula recargos salariales, horas extras y otros tributos aplicables en Colombia, actualizado a la normativa 2026.

## Características implementadas

### ✅ Recargos salariales actualizados 2026
- **Hora Extra Diurna** (6am - 9pm): +25%
- **Hora Extra Nocturna** (9pm - 6am): +75%
- **Recargo Nocturno** (hora ordinaria nocturna): +35%
- **Dominical/Festivo**: +80% (actualizado según reforma 2026)
- **Extra Diurna Dominical**: +105%
- **Extra Nocturna Dominical**: +155%

### ✅ Reforma Laboral 2026
El paquete tiene en cuenta la reducción de jornada laboral que entra en vigencia el 15 de julio de 2026:
- **Antes del 15 de julio 2026**: 220 horas mensuales
- **Desde el 15 de julio 2026**: 210 horas mensuales

## Integración en el proyecto

### Archivo modificado: `src/lib/salarios.ts`

```typescript
import { TASAS_RECARGO } from "tributos-co";

// Re-exportar funciones para uso en otros módulos
export {
  calcularHoraOrdinaria,
  calcularHoraExtraDiurna,
  calcularHoraExtraNocturna,
  calcularHoraOrdinariaNocturna,
  calcularHoraDominicalFestiva,
  calcularHoraExtraDiurnaDominical,
  calcularHoraExtraNocturnaDominical,
  TASAS_RECARGO,
} from "tributos-co";
```

### Funciones actualizadas

#### 1. `calcularHorasExtrasYRecargos()`
Ahora usa `TASAS_RECARGO` de tributos-co en lugar de constantes locales:

```typescript
export function calcularHorasExtrasYRecargos(
  salarioPorHora: SalarioPorHora
): HorasExtrasRecargos {
  const valorHoraBase = salarioPorHora.totalPorHora;
  
  return {
    valorHoraBase,
    horaExtraDiurna: {
      recargo: TASAS_RECARGO.EXTRA_DIURNA, // 0.25
      valorPorHora: valorHoraBase * (1 + TASAS_RECARGO.EXTRA_DIURNA),
    },
    // ... más tipos de horas
  };
}
```

#### 2. `calcularHoraConRecargo()`
Actualizada para usar las tasas de tributos-co:

```typescript
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
```

#### 3. `calcularCostoProyectoConExtras()`
Ahora soporta los 6 tipos de recargos:
- Extras diurnas
- Extras nocturnas
- Recargo nocturno
- Dominicales/festivos
- **Extras diurnas dominicales** (nuevo)
- **Extras nocturnas dominicales** (nuevo)

## Uso en la aplicación

### Ejemplo: Cálculo de proyecto con horas extras

```typescript
import { calcularCostoProyectoConExtras } from "@/lib/salarios";

const config = {
  salarioBase: 1750905,
  horasLegales: 192,
  // ... más configuración
};

const costo = calcularCostoProyectoConExtras(
  config,
  "Profesional",
  160, // horas ordinarias
  {
    extrasDiurnas: 10,
    extrasNocturnas: 5,
    dominicalesFestivos: 8,
    extrasDiurnasDominicales: 2,
    extrasNocturnasDominicales: 1,
  }
);

console.log(costo);
```

### Ejemplo: Acceso directo a funciones de tributos-co

```typescript
import {
  calcularHoraOrdinaria,
  calcularHoraExtraDiurna,
  TASAS_RECARGO,
} from "@/lib/salarios";

const salario = 2000000;

// Calcular hora ordinaria
const horaOrdinaria = calcularHoraOrdinaria(salario);
console.log(horaOrdinaria); // 9090.91 (antes del 15 julio 2026)

// Calcular hora extra diurna
const horaExtraDiurna = calcularHoraExtraDiurna(salario);
console.log(horaExtraDiurna); // 11363.64

// Obtener tasas directamente
console.log(TASAS_RECARGO.DOMINICAL_FESTIVO); // 0.8 (80%)
```

## Ventajas de la integración

1. **✅ Normativa actualizada**: Siempre alineado con la legislación colombiana vigente
2. **✅ Mantenimiento centralizado**: El paquete se actualiza independientemente
3. **✅ TypeScript**: Tipado fuerte para evitar errores en cálculos financieros
4. **✅ Todos los recargos**: Incluye todas las combinaciones de horas extras
5. **✅ Reforma 2026**: Automáticamente ajusta las horas según la fecha
6. **✅ Testing**: El paquete tiene sus propias pruebas automatizadas

## Migración realizada

### Antes (constantes locales)
```typescript
// En @/types/salarios
export const RECARGOS_LABORALES = {
  HORA_EXTRA_DIURNA: 0.25,
  HORA_EXTRA_NOCTURNA: 0.75,
  RECARGO_NOCTURNO: 0.35,
  DOMINICAL_FESTIVO: 0.75, // ⚠️ Desactualizado
};
```

### Ahora (tributos-co)
```typescript
import { TASAS_RECARGO } from "tributos-co";

// TASAS_RECARGO incluye:
// - EXTRA_DIURNA: 0.25
// - EXTRA_NOCTURNA: 0.75
// - RECARGO_NOCTURNO: 0.35
// - DOMINICAL_FESTIVO: 0.8 ✅ Actualizado
// - EXTRA_DIURNA_DOMINICAL: 2.05
// - EXTRA_NOCTURNA_DOMINICAL: 2.55
```

## Compatibilidad

✅ **Sin cambios en las APIs públicas**: Todas las funciones exportadas mantienen la misma firma  
✅ **Sin breaking changes**: El código existente sigue funcionando  
✅ **Mejoras automáticas**: Los cálculos ahora son más precisos y están actualizados  

## Próximos pasos

1. **Considerar eliminar** las constantes `RECARGOS_LABORALES` de `@/types/salarios.ts` si ya no se usan
2. **Actualizar tests** para verificar los nuevos tipos de recargos
3. **Actualizar UI** para mostrar los 6 tipos de recargos en lugar de solo 4
4. **Documentar** las diferencias de recargos antes/después del 15 julio 2026

## Referencias

- Paquete npm: https://www.npmjs.com/package/tributos-co
- Documentación completa: Ver README del paquete
- Normativa laboral colombiana: Código Sustantivo del Trabajo

---

**Fecha de integración**: 9 de enero de 2026  
**Versión de tributos-co**: 1.0.1
