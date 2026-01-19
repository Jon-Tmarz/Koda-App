# Ejemplo de Cálculo de Horas Extras y Recargos

## 📋 Normativa Laboral Colombiana

Según el Código Sustantivo del Trabajo de Colombia, los recargos son:

| Tipo de Hora | Recargo | Horario | Fórmula |
|--------------|---------|---------|---------|
| **Hora Extra Diurna** | 25% | 6am - 9pm | Valor hora × 1.25 |
| **Hora Extra Nocturna** | 75% | 9pm - 6am | Valor hora × 1.75 |
| **Recargo Nocturno** | 35% | 9pm - 6am (ordinarias) | Valor hora × 1.35 |
| **Dominical/Festivo** | 75% | Domingos y festivos | Valor hora × 1.75 |

---

## 💻 Uso en el Código

### **1. Calcular horas extras para un cargo específico**

```typescript
import { 
  calcularSalarioCompleto, 
  calcularHorasExtrasYRecargos,
  DEFAULT_SALARIO_CONFIG 
} from "@/lib/salarios";

// Configuración para 2025
const config = DEFAULT_SALARIO_CONFIG;

// Calcular salario completo para un Profesional
const salario = calcularSalarioCompleto(config, "Profesional");

// Obtener valores de horas extras y recargos
const horasExtras = calcularHorasExtrasYRecargos(salario.porHora);

console.log("Profesional - Valores por hora:");
console.log("Hora ordinaria:", horasExtras.valorHoraBase);
console.log("Hora extra diurna (+25%):", horasExtras.horaExtraDiurna.valorPorHora);
console.log("Hora extra nocturna (+75%):", horasExtras.horaExtraNocturna.valorPorHora);
console.log("Recargo nocturno (+35%):", horasExtras.recargoNocturno.valorPorHora);
console.log("Dominical/festivo (+75%):", horasExtras.dominicalFestivo.valorPorHora);
```

### **2. Calcular costo de proyecto con horas extras**

```typescript
import { calcularCostoProyectoConExtras } from "@/lib/salarios";

// Proyecto con horas ordinarias y extras
const costoProyecto = calcularCostoProyectoConExtras(
  config,
  "Profesional",
  160, // 160 horas ordinarias
  {
    extrasDiurnas: 10,        // 10 horas extras diurnas
    extrasNocturnas: 5,       // 5 horas extras nocturnas
    nocturnas: 0,             // 0 horas nocturnas ordinarias
    dominicalesFestivos: 8,   // 8 horas en domingos
  }
);

console.log("Resumen del proyecto:");
console.log("Horas ordinarias:", costoProyecto.horasOrdinarias);
console.log("Costo horas ordinarias:", costoProyecto.subtotalOrdinarias);
console.log("\nHoras extras:");
console.log("- Diurnas:", costoProyecto.horasExtras?.extrasDiurnas);
console.log("- Nocturnas:", costoProyecto.horasExtras?.extrasNocturnas);
console.log("- Dominicales:", costoProyecto.horasExtras?.dominicalesFestivos);
console.log("\nSubtotal extras:", costoProyecto.subtotalHorasExtras);
console.log("Total + IVA:", costoProyecto.total);
```

### **3. Calcular valor de una hora específica**

```typescript
import { calcularHoraConRecargo } from "@/lib/salarios";

const valorHoraBase = 78486; // Profesional por hora

const horaExtraDiurna = calcularHoraConRecargo(valorHoraBase, "extraDiurna");
const horaExtraNocturna = calcularHoraConRecargo(valorHoraBase, "extraNocturna");
const horaRecargoNocturno = calcularHoraConRecargo(valorHoraBase, "recargoNocturno");
const horaDominical = calcularHoraConRecargo(valorHoraBase, "dominicalFestivo");

console.log("Valores por hora:");
console.log("Base:", valorHoraBase);
console.log("Extra diurna:", horaExtraDiurna);
console.log("Extra nocturna:", horaExtraNocturna);
console.log("Recargo nocturno:", horaRecargoNocturno);
console.log("Dominical:", horaDominical);
```

---

## 📊 Ejemplo Real: Profesional (4x)

### Configuración Base 2025:
- **Salario Base:** $1,423,500
- **Auxilio Transporte:** $200,000
- **Horas Legales:** 192 horas/mes
- **Costo Empleado:** 1.5 (50% prestaciones)
- **Ganancia:** 30%
- **IVA:** 19%
- **Multiplicador:** 4x

### Cálculo del Valor Hora Base:

```
1. Salario base: $1,423,500
2. + Auxilio: $200,000
3. = Bruto: $1,623,500
4. × 1.5 (costos): $2,435,250
5. + 30% ganancia: $3,165,825
6. + 19% IVA: $3,767,332
7. × 4 (multiplicador): $15,069,328 (mensual)
8. ÷ 192 horas: $78,486/hora base
```

### Valores de Horas Especiales:

| Tipo de Hora | Cálculo | Valor/Hora |
|--------------|---------|------------|
| **Ordinaria** | $78,486 | $78,486 |
| **Extra Diurna (+25%)** | $78,486 × 1.25 | $98,108 |
| **Extra Nocturna (+75%)** | $78,486 × 1.75 | $137,351 |
| **Recargo Nocturno (+35%)** | $78,486 × 1.35 | $105,956 |
| **Dominical (+75%)** | $78,486 × 1.75 | $137,351 |

---

## 🎯 Ejemplo de Cotización con Horas Extras

### Proyecto: Desarrollo Web
- **Cargo:** Profesional
- **Horas ordinarias:** 120h
- **Horas extras diurnas:** 10h
- **Horas dominicales:** 8h

### Desglose de Costos:

```typescript
const resultado = calcularCostoProyectoConExtras(
  config,
  "Profesional",
  120,
  {
    extrasDiurnas: 10,
    dominicalesFestivos: 8,
  }
);

// Resultado:
{
  cargo: "Profesional",
  horasOrdinarias: 120,
  costoPorHoraOrdinaria: 78486,
  subtotalOrdinarias: 9418320,        // 120 × $78,486
  
  horasExtras: {
    extrasDiurnas: {
      horas: 10,
      valorHora: 98108,                 // $78,486 × 1.25
      subtotal: 981080                  // 10 × $98,108
    },
    dominicalesFestivos: {
      horas: 8,
      valorHora: 137351,                // $78,486 × 1.75
      subtotal: 1098808                 // 8 × $137,351
    }
  },
  
  subtotalHorasExtras: 2079888,        // $981,080 + $1,098,808
  subtotalTotal: 11498208,              // $9,418,320 + $2,079,888
  iva: 2184659,                         // 19% de $11,498,208
  total: 13682867                       // Subtotal + IVA
}
```

---

## 🔧 Funciones Disponibles

### **1. `RECARGOS_LABORALES`**
Constante con los porcentajes de recargo:
```typescript
export const RECARGOS_LABORALES = {
  HORA_EXTRA_DIURNA: 0.25,        // 25%
  HORA_EXTRA_NOCTURNA: 0.75,      // 75%
  RECARGO_NOCTURNO: 0.35,         // 35%
  DOMINICAL_FESTIVO: 0.75,        // 75%
}
```

### **2. `calcularHorasExtrasYRecargos(salarioPorHora)`**
Calcula todos los valores de horas especiales para un cargo.

**Parámetros:**
- `salarioPorHora: SalarioPorHora` - Salario por hora calculado

**Retorna:** `HorasExtrasRecargos` con todos los valores

### **3. `calcularHoraConRecargo(valorHoraBase, tipoHora)`**
Calcula el valor de una hora específica con recargo.

**Parámetros:**
- `valorHoraBase: number` - Valor hora ordinaria
- `tipoHora: TipoHoraEspecial` - Tipo de hora ("extraDiurna" | "extraNocturna" | "recargoNocturno" | "dominicalFestivo")

**Retorna:** `number` - Valor de la hora con recargo aplicado

### **4. `calcularCostoProyectoConExtras(...)`**
Calcula el costo completo de un proyecto incluyendo horas extras.

**Parámetros:**
- `config: SalarioConfig` - Configuración de salarios
- `cargo: CargoTipo` - Tipo de cargo
- `horasOrdinarias: number` - Horas normales
- `horasExtras?: { ... }` - Desglose de horas extras (opcional)

**Retorna:** Objeto con desglose completo del proyecto

---

## 📌 Notas Importantes

1. **Los recargos se aplican sobre el valor TOTAL por hora**, que ya incluye:
   - Salario base
   - Prestaciones y seguridad social
   - Ganancia de la empresa
   - IVA
   - Multiplicador del cargo

2. **Diferencia entre hora extra nocturna y recargo nocturno:**
   - **Hora extra nocturna (75%):** Es una hora ADICIONAL trabajada en horario nocturno (9pm-6am)
   - **Recargo nocturno (35%):** Es una hora ORDINARIA trabajada en horario nocturno

3. **Combinación de recargos:**
   - Una hora extra nocturna en domingo = 75% (extra nocturna) + 75% (dominical) = 150% adicional
   - Esto requeriría un cálculo combinado no implementado por defecto

4. **Para cotizaciones:**
   - Usa `calcularCostoProyectoConExtras()` para proyectos con horas extras
   - El resultado incluye IVA y todos los costos

---

**Fecha:** 6 de Enero de 2026  
**Implementado por:** GitHub Copilot  
**Normativa:** Código Sustantivo del Trabajo - Colombia
