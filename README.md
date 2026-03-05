# Koda - Sistema de Gestión Comercial

**Koda** es una aplicación web completa para la gestión de servicios profesionales y talento humano en Colombia. Diseñada específicamente para empresas de consultoría, desarrollo de software y servicios profesionales que necesitan cotizar proyectos con precisión según la normativa laboral colombiana vigente.

## Características principales

- 💼 **Gestión de Leads**: Seguimiento completo del pipeline de ventas, desde contacto inicial hasta cierre
- 📊 **Cotizaciones Inteligentes**: Generación de cotizaciones con cálculos automáticos de horas, recargos laborales e IVA
- � **Multidivisa**: Genera cotizaciones en COP (Pesos Colombianos) y USD (Dólares) con tasas de cambio actualizadas
- 👥 **Gestión de Talento**: Control de costos de personal por cargo (Auxiliar, Técnico, Tecnólogo, Profesional, Especialista, Master)
- ⚖️ **Cumplimiento Legal**: Cálculos de recargos salariales según normativa laboral colombiana actualizada 2026
- 🔌 **API REST Completa**: Endpoints para integración con n8n, Zapier y otras herramientas de automatización
- 🎨 **Interfaz Moderna**: Dashboard intuitivo con tema claro/oscuro

## Stack Tecnológico

- **Framework**: [Next.js 14](https://nextjs.org) con App Router
- **Base de datos**: Firebase/Firestore
- **UI**: React + Tailwind CSS + shadcn/ui
- **TypeScript**: Tipado fuerte en todo el proyecto
- **Autenticación**: Sistema de API Keys y gestión de usuarios

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🇨🇴 Integración tributos-co

Este proyecto utiliza el paquete [`tributos-co`](https://www.npmjs.com/package/tributos-co) para cálculos de recargos salariales según la normativa laboral colombiana actualizada 2026.

**Características:**
- ✅ Recargos actualizados: Extra diurna (+25%), Extra nocturna (+75%), Nocturna (+35%), Dominical/Festivo (+80%)
- ✅ Reforma laboral 2026: Ajuste automático de horas mensuales (220h → 210h desde 15 julio 2026)
- ✅ Todos los tipos de recargos: Incluye combinaciones dominicales
- ✅ TypeScript: Tipado fuerte para evitar errores

> 📄 Ver documentación completa: [INTEGRACION_TRIBUTOS_CO.md](./INTEGRACION_TRIBUTOS_CO.md)

---

## API Endpoints

### Salarios API

Endpoints para consultar valores de salarios por hora con recargos legales según la normativa laboral colombiana.

#### GET `/api/salarios`

Retorna los valores por hora para todos los cargos con sus recargos legales.

**Query Parameters:**
- `año` (opcional) - Año para consultar la configuración (ej: 2025, 2026). Por defecto usa el año actual.

**Ejemplo de uso:**
```bash
GET /api/salarios?año=2025
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "año": 2025,
    "salarioBase": 1423500,
    "horasLegales": 192,
    "salarios": [
      {
        "cargo": "Auxiliar",
        "multiplicador": 1,
        "horasLegales": 192,
        "desglose": {
          "salarioBasePorHora": 7414.06,
          "costoEmpresaPorHora": 11121.09,
          "gananciaPorHora": 3336.33,
          "ivaPorHora": 2746.91,
          "totalPorHora": 24618.39
        },
        "tiposDeHora": {
          "horaOrdinaria": {
            "recargo": 0,
            "valorPorHora": 24618.39
          },
          "horaExtraDiurna": {
            "recargo": 0.25,
            "valorPorHora": 30772.99
          },
          "recargoNocturno": {
            "recargo": 0.35,
            "valorPorHora": 33234.83
          },
          "horaExtraNocturna": {
            "recargo": 0.75,
            "valorPorHora": 43082.18
          },
          "dominicalFestivo": {
            "recargo": 0.75,
            "valorPorHora": 43082.18
          }
        }
      }
      // ... más cargos (Técnico, Tecnólogo, Profesional, Especialista, Master)
    ]
  }
}
```

**Errores:**
- `400` - Año no válido
- `404` - No existe configuración para el año solicitado
- `500` - Error interno del servidor

---

#### GET `/api/salarios/[cargo]`

Retorna los valores por hora para un cargo específico con sus recargos legales.

**Path Parameters:**
- `cargo` (requerido) - Nombre del cargo. Valores válidos: `Auxiliar`, `Técnico`, `Tecnólogo`, `Profesional`, `Especialista`, `Master`

**Query Parameters:**
- `año` (opcional) - Año para consultar la configuración (ej: 2025, 2026). Por defecto usa el año actual.

**Ejemplo de uso:**
```bash
GET /api/salarios/Profesional?año=2025
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "cargo": "Profesional",
    "multiplicador": 4,
    "horasLegales": 192,
    "desglose": {
      "salarioBasePorHora": 7414.06,
      "costoEmpresaPorHora": 11121.09,
      "gananciaPorHora": 3336.33,
      "ivaPorHora": 2746.91,
      "totalPorHora": 68819.20
    },
    "tiposDeHora": {
      "horaOrdinaria": {
        "recargo": 0,
        "recargoTexto": "-",
        "valorPorHora": 68819.20
      },
      "horaExtraDiurna": {
        "recargo": 0.25,
        "recargoTexto": "+25%",
        "valorPorHora": 86024.00
      },
      "recargoNocturno": {
        "recargo": 0.35,
        "recargoTexto": "+35%",
        "valorPorHora": 92905.92
      },
      "horaExtraNocturna": {
        "recargo": 0.75,
        "recargoTexto": "+75%",
        "valorPorHora": 120433.60
      },
      "dominicalFestivo": {
        "recargo": 0.75,
        "recargoTexto": "+75%",
        "valorPorHora": 120433.60
      }
    }
  }
}
```

**Errores:**
- `400` - Cargo no válido o año no válido
- `404` - No existe configuración para el año solicitado
- `500` - Error interno del servidor

**Tipos de hora según normativa laboral colombiana:**
- **Hora Ordinaria**: Sin recargo adicional
- **Extra Diurna**: +25% (6am - 9pm)
- **Recargo Nocturno**: +35% (9pm - 6am, hora ordinaria)
- **Extra Nocturna**: +75% (9pm - 6am, hora extra)
- **Dominical/Festivo**: +75%

---

### Cotizaciones API

Endpoints REST para gestionar cotizaciones. Ideal para integraciones con n8n, Zapier u otras herramientas de automatización.

#### GET `/api/quotes`

Obtiene todas las cotizaciones ordenadas por fecha (más recientes primero).

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "numero": "COT-2026-0001",
      "items": [
        {
          "descripcion": "Desarrollo aplicación web",
          "horas": 40,
          "costoPorHora": 50000,
          "subtotal": 2000000
        }
      ],
      "subtotal": 2000000,
      "iva": 380000,
      "total": 2380000,
      "estado": "borrador",
      "fecha": "2026-01-08T12:00:00.000Z",
      "pdfUrl": null,
      "createdAt": "2026-01-08T12:00:00.000Z",
      "updatedAt": "2026-01-08T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/quotes/[id]`

Obtiene una cotización específica por su ID.

**Path Parameters:**
- `id` (requerido) - ID de la cotización

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "numero": "COT-2026-0001",
    "items": [...],
    "subtotal": 2000000,
    "iva": 380000,
    "total": 2380000,
    "estado": "borrador",
    "fecha": "2026-01-08T12:00:00.000Z",
    "pdfUrl": null,
    "createdAt": "2026-01-08T12:00:00.000Z",
    "updatedAt": "2026-01-08T12:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Cotización no encontrada

---

#### POST `/api/quotes`

Crea una nueva cotización.

**Request Body:**
```json
{
  "numero": "COT-2026-0001",
  "items": [
    {
      "descripcion": "Desarrollo aplicación web",
      "horas": 40,
      "costoPorHora": 50000,
      "subtotal": 2000000
    }
  ],
  "subtotal": 2000000,
  "iva": 380000,
  "total": 2380000,
  "estado": "borrador"
}
```

**Campos requeridos:**
- `numero` - Número único de cotización
- `items` - Array con al menos un item
  - `descripcion` - Descripción del servicio
  - `horas` - Cantidad de horas
  - `costoPorHora` - Costo por hora
  - `subtotal` - Subtotal del item
- `subtotal` - Suma de subtotales
- `iva` - IVA (19%)
- `total` - Total con IVA
- `estado` - Estado: `borrador`, `enviada`, `aprobada`, `rechazada`

**Campos opcionales:**
- `pdfUrl` - URL del PDF generado

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Cotización creada exitosamente",
  "data": {
    "id": "xyz789",
    "numero": "COT-2026-0001",
    ...
  }
}
```

**Errores:**
- `400` - Validación fallida

---

#### PUT `/api/quotes/[id]`

Actualiza una cotización existente. Solo los campos proporcionados serán actualizados.

**Path Parameters:**
- `id` (requerido) - ID de la cotización

**Request Body (ejemplo actualización parcial):**
```json
{
  "estado": "aprobada",
  "pdfUrl": "https://storage.example.com/quotes/COT-2026-0001.pdf"
}
```

**Campos actualizables:**
- `numero`, `items`, `subtotal`, `iva`, `total`, `estado`, `pdfUrl`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Cotización actualizada exitosamente",
  "data": { ... }
}
```

**Errores:**
- `400` - Validación fallida
- `404` - Cotización no encontrada

---

#### POST `/api/quotes/[id]/send`

Envía los datos de una cotización específica a un webhook de N8N (configurado en la sección de Setup) y actualiza el estado de la cotización a "enviada". Esta acción se invoca normalmente desde la interfaz de usuario, pero también puede ser activada por un sistema externo si se desea automatizar el envío.

**Path Parameters:**
- `id` (requerido) - ID de la cotización a enviar.

**Request Body:**
- Vacío.

**Acciones:**
1.  Obtiene la cotización y los datos del cliente asociado.
2.  Busca la URL del webhook de N8N en la configuración global.
3.  Envía un objeto JSON con los datos de `quote`, `lead` y `config` al webhook de N8N.
4.  Actualiza el estado de la cotización a `enviada`.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Data sent to webhook successfully"
}
```

**Errores:**
- `400` - Falta el ID de la cotización.
- `404` - Cotización o cliente no encontrados.
- `500` - La URL del webhook de N8N no está configurada o hubo un error interno.

---

#### DELETE `/api/quotes/[id]`

Elimina permanentemente una cotización.

**Path Parameters:**
- `id` (requerido) - ID de la cotización

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Cotización eliminada exitosamente",
  "data": {
    "id": "abc123",
    "deletedAt": "2026-01-08T12:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Cotización no encontrada

**Estados válidos:**
- `borrador` - En proceso de creación
- `enviada` - Enviada al cliente
- `aprobada` - Aprobada por el cliente
- `rechazada` - Rechazada

**Testing con curl:**
```bash
# Listar cotizaciones
curl http://localhost:3000/api/quotes

# Crear cotización
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"numero":"COT-2026-TEST","items":[{"descripcion":"Test","horas":10,"costoPorHora":50000,"subtotal":500000}],"subtotal":500000,"iva":95000,"total":595000,"estado":"borrador"}'

# Actualizar estado
curl -X PUT http://localhost:3000/api/quotes/{id} \
  -H "Content-Type: application/json" \
  -d '{"estado":"aprobada"}'

# Eliminar
curl -X DELETE http://localhost:3000/api/quotes/{id}
```

> 📄 Para documentación completa sobre integración con n8n, consulta [API_QUOTES_DOCUMENTATION.md](./API_QUOTES_DOCUMENTATION.md)

---

### Leads API

Endpoints REST para gestionar leads (clientes potenciales). **Diseñados para integraciones externas con n8n, webhooks u otras herramientas de automatización.** La aplicación web usa Firestore directamente.

#### GET `/api/leads`

Obtiene todos los leads ordenados por fecha de creación (más recientes primero).

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "lead123",
      "empresa": "Tech Solutions SA",
      "contacto": "Juan Pérez",
      "email": "juan@techsolutions.com",
      "telefono": "+57 300 123 4567",
      "estado": "nuevo",
      "notas": "Interesado en desarrollo web",
      "createdAt": "2026-01-09T10:00:00.000Z",
      "updatedAt": "2026-01-09T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### GET `/api/leads/[id]`

Obtiene un lead específico por su ID.

**Path Parameters:**
- `id` (requerido) - ID del lead

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "lead123",
    "empresa": "Tech Solutions SA",
    "contacto": "Juan Pérez",
    "email": "juan@techsolutions.com",
    "telefono": "+57 300 123 4567",
    "estado": "nuevo",
    "notas": "Interesado en desarrollo web",
    "createdAt": "2026-01-09T10:00:00.000Z",
    "updatedAt": "2026-01-09T10:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Lead no encontrado

---

#### POST `/api/leads`

Crea un nuevo lead.

**Request Body:**
```json
{
  "empresa": "Tech Solutions SA",
  "contacto": "Juan Pérez",
  "email": "juan@techsolutions.com",
  "telefono": "+57 300 123 4567",
  "estado": "nuevo",
  "notas": "Interesado en desarrollo web"
}
```

**Campos requeridos:**
- `empresa` - Nombre de la empresa
- `contacto` - Nombre de la persona de contacto
- `email` - Email válido del contacto

**Campos opcionales:**
- `telefono` - Número de teléfono
- `estado` - Estado del lead (default: `nuevo`)
  - Valores válidos: `nuevo`, `contactado`, `negociacion`, `cerrado`, `perdido`
- `notas` - Notas adicionales sobre el lead

**Validaciones:**
- Email debe tener formato válido
- Estado debe ser uno de los valores permitidos

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Lead creado exitosamente",
  "data": {
    "id": "lead456",
    "empresa": "Tech Solutions SA",
    "contacto": "Juan Pérez",
    "email": "juan@techsolutions.com",
    "telefono": "+57 300 123 4567",
    "estado": "nuevo",
    "notas": "Interesado en desarrollo web"
  }
}
```

**Errores:**
- `400` - Datos incompletos, email inválido o estado inválido

---

#### PUT `/api/leads/[id]`

Actualiza un lead existente. Solo los campos proporcionados serán actualizados.

**Path Parameters:**
- `id` (requerido) - ID del lead

**Request Body (ejemplo actualización parcial):**
```json
{
  "estado": "contactado",
  "notas": "Llamada realizada el 09/01/2026. Interesado en cotización."
}
```

**Campos actualizables:**
- `empresa`, `contacto`, `email`, `telefono`, `estado`, `notas`

**Validaciones:**
- Email debe tener formato válido (si se proporciona)
- Estado debe ser uno de los valores permitidos (si se proporciona)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Lead actualizado exitosamente",
  "data": {
    "id": "lead123",
    "empresa": "Tech Solutions SA",
    "contacto": "Juan Pérez",
    "email": "juan@techsolutions.com",
    "telefono": "+57 300 123 4567",
    "estado": "contactado",
    "notas": "Llamada realizada el 09/01/2026. Interesado en cotización.",
    "createdAt": "2026-01-09T10:00:00.000Z",
    "updatedAt": "2026-01-09T14:30:00.000Z"
  }
}
```

**Errores:**
- `400` - Email inválido o estado inválido
- `404` - Lead no encontrado

---

#### DELETE `/api/leads/[id]`

Elimina permanentemente un lead.

**Path Parameters:**
- `id` (requerido) - ID del lead

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Lead eliminado exitosamente"
}
```

**Errores:**
- `404` - Lead no encontrado

**Estados del lead (flujo típico):**
- `nuevo` - Lead recién creado
- `contactado` - Se realizó primer contacto
- `negociacion` - En proceso de negociación
- `cerrado` - Convertido a cliente
- `perdido` - Oportunidad perdida

**Testing con curl:**
```bash
# Listar todos los leads
curl http://localhost:3000/api/leads

# Crear lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"empresa":"Acme Corp","contacto":"María García","email":"maria@acme.com","telefono":"+57 310 555 1234","estado":"nuevo","notas":"Contacto desde web"}'

# Obtener lead específico
curl http://localhost:3000/api/leads/{id}

# Actualizar estado
curl -X PUT http://localhost:3000/api/leads/{id} \
  -H "Content-Type: application/json" \
  -d '{"estado":"contactado","notas":"Primera llamada exitosa"}'

# Eliminar lead
curl -X DELETE http://localhost:3000/api/leads/{id}
```

> **Nota:** Los componentes de la aplicación web usan Firestore directamente mediante `@/lib/firestore-services`. Estos endpoints API están diseñados específicamente para integraciones externas (n8n, webhooks, etc.).

---

### Herramientas API

Endpoints REST para gestionar las herramientas y software utilizados.

#### GET `/api/tools`

Obtiene herramientas con filtros opcionales. **No requiere autenticación**.

**Query Parameters (todos opcionales):**
- `disponibles=true` - Retorna solo herramientas disponibles
- `id=X` - Búsqueda exacta por ID
- `proveedor=X` - Búsqueda parcial por proveedor (case-insensitive)
- `categoria=X` - Búsqueda exacta por categoría (case-insensitive)
- `nombre=X` - Búsqueda parcial por nombre (case-insensitive)

**Ejemplo de uso:**
```bash
# Obtener todas las herramientas
curl http://localhost:3000/api/tools

# Obtener solo herramientas disponibles
curl http://localhost:3000/api/tools?disponibles=true

# Buscar por categoría
curl http://localhost:3000/api/tools?categoria=Software

# Buscar por proveedor
curl http://localhost:3000/api/tools?proveedor=AWS

# Buscar por nombre
curl http://localhost:3000/api/tools?nombre=EC2

# Combinar filtros
curl http://localhost:3000/api/tools?categoria=Software&disponibles=true
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tool123",
      "nombre": "AWS EC2",
      "categoria": "infraestructura",
      "tipoCobranza": "uso",
      "costo": 150,
      "divisa": "USD",
      "proveedor": "Amazon Web Services",
      "descripcion": "Servicio de computación elástica en la nube",
      "disponible": true,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z"
    }
  ]
}
```

---

#### GET `/api/tools/[id]`

Obtiene una herramienta específica por su ID. **No requiere autenticación**.

**Path Parameters:**
- `id` (requerido) - ID de la herramienta

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/tools/tool123
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "tool123",
    "nombre": "AWS EC2",
    "categoria": "infraestructura",
    "tipoCobranza": "uso",
    "costo": 150,
    "divisa": "USD",
    "proveedor": "Amazon Web Services",
    "descripcion": "Servicio de computación elástica en la nube",
    "disponible": true,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Herramienta no encontrada

---

#### POST `/api/tools`

Crea una nueva herramienta. **Requiere API Key válida en headers**.

**Request Body:**
```json
{
  "nombre": "Figma",
  "categoria": "Software",
  "tipoCobranza": "mensual",
  "costo": 15,
  "divisa": "USD",
  "proveedor": "Figma Inc.",
  "descripcion": "Herramienta de diseño colaborativo",
  "disponible": true
}
```

**Categorías válidas:**
- `Software`
- `infraestructura`
- `Plataforma`
- `Servicio`
- `otro`

**Tipos de cobranza válidos:**
- `mensual`
- `anual`
- `uso`
- `unico`

**Divisas válidas:**
- `USD`
- `COP`

**Campos requeridos:** 
- `nombre`
- `categoria`
- `tipoCobranza`

**Campos opcionales:**
- `costo` (default: 0)
- `divisa` (default: USD)
- `descripcion`
- `proveedor`
- `disponible` (default: true)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Herramienta creada exitosamente"
}
```

**Ejemplo con curl:**
```bash
curl -X POST \
  -H "Authorization: Bearer TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Sentry",
    "categoria": "Software",
    "tipoCobranza": "mensual",
    "costo": 29,
    "divisa": "USD",
    "proveedor": "Sentry Inc."
  }' \
  http://localhost:3000/api/tools
```

---

#### PUT `/api/tools/[id]`

Actualiza una herramienta existente. **Requiere API Key válida en headers**. Solo los campos proporcionados serán actualizados (actualización parcial).

**Path Parameters:**
- `id` (requerido) - ID de la herramienta a actualizar

**Request Body:**
```json
{
  "nombre": "Figma Pro",
  "costo": 25,
  "disponible": false
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Herramienta actualizada exitosamente",
  "data": {
    "id": "tool456",
    "nombre": "Figma Pro",
    "categoria": "Software",
    "tipoCobranza": "mensual",
    "costo": 25,
    "divisa": "USD",
    "proveedor": "Figma Inc.",
    "descripcion": "Herramienta de diseño colaborativo",
    "disponible": false,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T12:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Herramienta no encontrada

**Ejemplo con curl:**
```bash
curl -X PUT \
  -H "Authorization: Bearer TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"costo": 25}' \
  http://localhost:3000/api/tools/tool456
```

---

#### DELETE `/api/tools/[id]`

Elimina una herramienta. **Requiere API Key válida en headers**.

**Path Parameters:**
- `id` (requerido) - ID de la herramienta a eliminar

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Herramienta eliminada exitosamente",
  "data": {
    "id": "tool789"
  }
}
```

**Errores:**
- `404` - Herramienta no encontrada

**Ejemplo con curl:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer TU_API_KEY" \
  http://localhost:3000/api/tools/tool789
```

---

**Resumen de autenticación:**
- `GET /api/tools` - ✅ Sin autenticación
- `GET /api/tools/[id]` - ✅ Sin autenticación
- `POST /api/tools` - 🔒 Requiere API Key
- `PUT /api/tools/[id]` - 🔒 Requiere API Key
- `DELETE /api/tools/[id]` - 🔒 Requiere API Key

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
