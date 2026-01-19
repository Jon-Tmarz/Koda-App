# Ejemplo de Cálculo de Salarios - Nueva Lógica

## Configuración Base (2025)
- **Salario Base (SMMLV):** $1,423,500
- **Auxilio de Transporte:** $200,000
- **Horas Legales Mensuales:** 192 horas
- **Factor Costo Empleado:** 1.5 (50% adicional por prestaciones)
- **Ganancia Empresa:** 30%
- **IVA:** 19%

---

## Multiplicadores por Cargo
- **Auxiliar:** 1x
- **Técnico:** 2x
- **Tecnólogo:** 3x
- **Profesional:** 4x
- **Profesional Especialista:** 5x
- **Profesional Master:** 7x

---

## Ejemplo Cálculo: Cargo PROFESIONAL (4x)

### ⚠️ IMPORTANTE: El multiplicador se aplica AL FINAL

### Paso a Paso:

```
1. Salario Base (FIJO):              $1,423,500
2. + Auxilio de Transporte:          $  200,000
3. = Salario Bruto:                  $1,623,500

4. × Factor Costo Empleado (1.5):    $2,435,250
5. = Costo Empresa

6. × Ganancia (30%):                 $  730,575
7. = Ganancia Valor

8. Costo + Ganancia:                 $3,165,825
9. = Subtotal

10. × IVA (19%):                     $  601,507
11. = IVA Valor

12. Subtotal + IVA:                  $3,767,332
13. = Total Calculado

14. × MULTIPLICADOR (4x):            $15,069,328  ← AQUÍ SE APLICA
15. = TOTAL MENSUAL

16. Total Mensual ÷ 192 horas:       $78,486/hora
17. = COSTO POR HORA
```

---

## Comparación Todos los Cargos

| Cargo | Multiplicador | Total Base Calculado | Total Mensual | Costo/Hora |
|-------|---------------|---------------------|---------------|------------|
| **Auxiliar** | 1x | $3,767,332 | $3,767,332 | $19,621 |
| **Técnico** | 2x | $3,767,332 | $7,534,664 | $39,243 |
| **Tecnólogo** | 3x | $3,767,332 | $11,301,996 | $58,865 |
| **Profesional** | 4x | $3,767,332 | $15,069,328 | $78,486 |
| **Prof. Especialista** | 5x | $3,767,332 | $18,836,660 | $98,108 |
| **Prof. Master** | 7x | $3,767,332 | $26,371,324 | $137,371 |

---

## 💡 ¿Por qué multiplicar al final?

**Multiplicar al inicio (INCORRECTO):**
```
Salario Base × 4 = $5,694,000
+ Costos y ganancia
= Total menor que cubre mal los costos reales
```

**Multiplicar al final (CORRECTO):**
```
Salario Base + Costos + Ganancia + IVA = $3,767,332
× 4 = $15,069,328
= Cubre TODOS los costos proporcionalmente
```

Al multiplicar al final, se garantiza que:
1. ✅ Todos los costos de prestaciones están incluidos
2. ✅ La ganancia de la empresa se multiplica también
3. ✅ El IVA se calcula sobre valores reales
4. ✅ **NO hay pérdidas para la compañía**

---

## Fórmula General

```typescript
totalMensual = (
  (
    (salarioBase + auxilioTransporte) 
    × costoEmpleado 
    × (1 + ganancia/100)
  ) 
  × (1 + iva/100)
) × multiplicador

// Para el ejemplo:
totalMensual = (
  (1,423,500 + 200,000) 
  × 1.5 
  × 1.3
) × 1.19 × 4

totalMensual = 1,623,500 × 1.5 × 1.3 × 1.19 × 4
totalMensual = $15,069,328
```

---

## Archivos Actualizados

- ✅ `src/types/salarios.ts` - Interfaces con documentación correcta
- ✅ `src/lib/salarios.ts` - Funciones de cálculo con multiplicador al final
- ✅ `src/lib/firestore-services.ts` - Generación de cargos calculados consistente

---

**Fecha:** 30 de Diciembre de 2025  
**Implementado por:** GitHub Copilot
