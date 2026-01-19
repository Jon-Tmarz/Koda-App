# Funcionalidad de Divisas

## Descripción

Sistema para consultar y almacenar tasas de cambio USD -> COP desde una API externa. Mantiene un historial de las últimas 25 consultas en Firestore.

## Variables de Entorno

```env
NEXT_PUBLIC_EXCHANGE_API_KEY=https://v6.exchangerate-api.com/v6/YOUR_KEY/pair/USD/COP
NEXT_PUBLIC_EXCHANGE_REQ=conversion_rate
```

## Estructura

### 1. Servicio de Divisas (`src/lib/divisas-service.ts`)

Funciones principales:

- **`fetchExchangeRate()`**: Consulta la API de divisas y retorna el rate
- **`saveExchangeRate(rate)`**: Guarda el rate en Firestore
- **`getExchangeRates()`**: Obtiene todos los rates almacenados (max 25)
- **`getLatestExchangeRate()`**: Obtiene el último rate almacenado
- **`updateExchangeRate()`**: Función todo-en-uno que consulta y guarda

#### Gestión automática de registros:
- Automáticamente elimina registros antiguos
- Mantiene solo los últimos 25 registros
- Los registros se ordenan por timestamp descendente

### 2. API Route (`src/app/api/divisas/route.ts`)

#### GET `/api/divisas`
Obtiene exchange rates almacenados

**Query Parameters:**
- `latest=true`: Retorna solo el último exchange rate
- Sin params: Retorna todos (max 25)

**Ejemplo:**
```bash
# Obtener último rate
GET /api/divisas?latest=true

# Obtener todos los rates
GET /api/divisas
```

#### POST `/api/divisas`
Consulta la API y guarda un nuevo exchange rate

**Ejemplo:**
```bash
POST /api/divisas
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rate actualizado correctamente",
  "data": {
    "id": "abc123",
    "rate": 4250.50,
    "fromCurrency": "USD",
    "toCurrency": "COP",
    "timestamp": "...",
    "createdAt": "2026-01-18T..."
  }
}
```

### 3. Script de Actualización (`scripts/update-exchange-rate.ts`)

Script standalone para ejecutar manualmente o desde cron jobs.

**Instalación de dependencias:**
```bash
npm install dotenv firebase-admin
```

**Ejecución:**
```bash
npm run update:exchange
```

**Características:**
- Usa Firebase Admin SDK para acceso directo a Firestore
- Carga variables de entorno desde `.env.local`
- Logs detallados del proceso
- Manejo de errores con códigos de salida

## Uso en el Código

### Consultar y guardar nuevo rate

```typescript
import { updateExchangeRate } from '@/lib/divisas-service';

// Consulta API y guarda en Firestore
const rate = await updateExchangeRate();
console.log(`Nuevo rate: ${rate.rate}`);
```

### Obtener último rate para cálculos

```typescript
import { getLatestExchangeRate } from '@/lib/divisas-service';

const latestRate = await getLatestExchangeRate();
if (latestRate) {
  const salarioUSD = 5000;
  const salarioCOP = salarioUSD * latestRate.rate;
  console.log(`${salarioUSD} USD = ${salarioCOP} COP`);
}
```

### Obtener historial completo

```typescript
import { getExchangeRates } from '@/lib/divisas-service';

const rates = await getExchangeRates();
console.log(`Tienes ${rates.length} rates almacenados`);
```

## Colección Firestore

**Nombre:** `divisas`

**Estructura del documento:**
```typescript
{
  rate: number;              // Ej: 4250.50
  fromCurrency: string;      // "USD"
  toCurrency: string;        // "COP"
  timestamp: Timestamp;      // Firestore Timestamp
  createdAt: Date;          // JavaScript Date
}
```

**Índices recomendados:**
- `timestamp` (DESC) - Para ordenar y limpiar registros antiguos

## Automatización

### Opción 1: Cron Job Local
```bash
# Ejecutar cada hora
0 * * * * cd /path/to/project && npm run update:exchange
```

### Opción 2: GitHub Actions
```yaml
name: Update Exchange Rate
on:
  schedule:
    - cron: '0 * * * *'  # Cada hora
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run update:exchange
```

### Opción 3: Vercel Cron Jobs
Configurar en `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/divisas",
    "schedule": "0 * * * *"
  }]
}
```

## Próximos Pasos

1. **Aplicar divisas a cálculos de salarios**: Multiplicar salarios en USD por el último rate
2. **Dashboard de divisas**: Visualizar historial con gráficas (usando Recharts)
3. **Alertas**: Notificar cuando el rate cambie significativamente
4. **Caché**: Implementar caché para evitar consultas excesivas a la API

## Mantenimiento

- Los registros antiguos se eliminan automáticamente
- Verificar logs para detectar errores en la API
- Monitorear límites de la API de divisas
- Revisar periódicamente que los 25 registros sean suficientes
