# Integración con n8n

Esta guía te ayudará a conectar tu aplicación Koda con n8n para automatizar procesos.

## 📋 Requisitos Previos

1. **Cuenta de n8n** (cloud o self-hosted)
2. **API Key de Koda** generada desde el panel de Setup

## 🔑 Generación de API Key

1. Inicia sesión en tu aplicación Koda
2. Ve a **Dashboard > Setup**
3. En la sección **API Keys**, haz clic en **Nueva API Key**
4. Asigna un nombre descriptivo (ej: "Integración n8n")
5. (Opcional) Agrega una descripción
6. Haz clic en **Generar API Key**
7. **¡IMPORTANTE!** Copia la API key inmediatamente. Solo se mostrará una vez por seguridad

```
Ejemplo de API Key:
koda_1n2x3y4z_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## 🔧 Configuración en n8n

### Opción 1: Usar HTTP Request Node

1. Crea un nuevo workflow en n8n
2. Agrega un nodo **HTTP Request**
3. Configura los siguientes parámetros:

#### Configuración del Nodo HTTP Request

**Authentication:**
- Method: `Generic Credential Type`
- Generic Auth Type: `Header Auth`
- Name: `Authorization`
- Value: `Bearer TU_API_KEY_AQUI`

**Request:**
- Method: Según la operación (GET, POST, PUT, DELETE)
- URL: `https://tu-dominio.com/api/[endpoint]`

### Opción 2: Usar Credentials Personalizadas

1. Ve a **Settings > Credentials** en n8n
2. Crea una nueva credencial de tipo **Header Auth**
3. Configura:
   - **Name:** `Koda API`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer TU_API_KEY_AQUI`

## 📡 Endpoints Disponibles

### Base URL
```
https://tu-dominio.com/api
```

### Autenticación
Todas las peticiones requieren incluir la API key en el header:

```http
Authorization: Bearer TU_API_KEY
```

O alternativamente:
```http
X-API-Key: TU_API_KEY
```

---

## 📝 Leads (Prospectos)

### Listar todos los leads
```http
GET /api/leads
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "contacto": "Juan Pérez",
      "empresa": "Tech Corp",
      "email": "juan@techcorp.com",
      "telefono": "+57 300 123 4567",
      "estado": "nuevo",
      "notas": "Interesado en desarrollo web",
      "createdAt": "2026-01-17T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Obtener un lead específico
```http
GET /api/leads/[id]
```

### Crear un nuevo lead
```http
POST /api/leads
Content-Type: application/json

{
  "contacto": "María López",
  "empresa": "Digital Solutions",
  "email": "maria@digital.com",
  "telefono": "+57 301 234 5678",
  "estado": "nuevo",
  "notas": "Lead desde formulario de contacto"
}
```

**Estados válidos:** `nuevo`, `contactado`, `negociacion`, `cerrado`, `perdido`

### Actualizar un lead
```http
PUT /api/leads/[id]
Content-Type: application/json

{
  "estado": "contactado",
  "notas": "Llamada realizada - seguimiento la próxima semana"
}
```

### Eliminar un lead
```http
DELETE /api/leads/[id]
```

---

## 💰 Cotizaciones (Quotes)

### Listar todas las cotizaciones
```http
GET /api/quotes
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "xyz789",
      "numero": "COT-2026-0001",
      "items": [
        {
          "descripcion": "Desarrollo web responsive",
          "horas": 40,
          "costoPorHora": 50000,
          "subtotal": 2000000
        }
      ],
      "subtotal": 2000000,
      "iva": 380000,
      "total": 2380000,
      "estado": "enviada",
      "fecha": "2026-01-17T14:00:00.000Z",
      "pdfUrl": null
    }
  ],
  "count": 1
}
```

### Obtener una cotización específica
```http
GET /api/quotes/[id]
```

### Crear una nueva cotización
```http
POST /api/quotes
Content-Type: application/json

{
  "numero": "COT-2026-0002",
  "items": [
    {
      "descripcion": "Desarrollo de aplicación móvil",
      "horas": 80,
      "costoPorHora": 60000,
      "subtotal": 4800000
    },
    {
      "descripcion": "Backend API",
      "horas": 40,
      "costoPorHora": 55000,
      "subtotal": 2200000
    }
  ],
  "subtotal": 7000000,
  "iva": 1330000,
  "total": 8330000,
  "estado": "borrador"
}
```

**Estados válidos:** `borrador`, `enviada`, `aprobada`, `rechazada`

### Actualizar una cotización
```http
PUT /api/quotes/[id]
Content-Type: application/json

{
  "estado": "aprobada"
}
```

### Eliminar una cotización
```http
DELETE /api/quotes/[id]
```

---

## 🔐 Validar API Key

Puedes validar que tu API key es correcta usando:

```http
GET /api/auth/validate
Authorization: Bearer TU_API_KEY
```

**Respuesta exitosa:**
```json
{
  "valid": true,
  "message": "API key válida",
  "apiKeyId": "def456"
}
```

**Respuesta con error:**
```json
{
  "valid": false,
  "error": "API key inválida o inactiva"
}
```

---

## 💡 Ejemplos de Workflows en n8n

### Ejemplo 1: Capturar leads desde webhook y guardar en Koda

```
Webhook Trigger → HTTP Request (POST /api/leads) → Email de confirmación
```

**Configuración del HTTP Request:**
- URL: `https://tu-dominio.com/api/leads`
- Method: `POST`
- Authentication: Header Auth con `Authorization: Bearer TU_API_KEY`
- Body:
```json
{
  "contacto": "{{ $json.contacto }}",
  "empresa": "{{ $json.empresa }}",
  "email": "{{ $json.email }}",
  "telefono": "{{ $json.telefono }}",
  "estado": "nuevo",
  "notas": "Lead capturado desde webhook"
}
```

### Ejemplo 2: Sincronizar leads nuevos a CRM externo

```
Schedule Trigger (cada hora) → HTTP Request (GET /api/leads) → Filter (estado=nuevo) → HTTP Request (enviar a CRM) → HTTP Request (PUT /api/leads/[id] - actualizar estado)
```

### Ejemplo 3: Enviar email cuando se crea cotización

```
Webhook Trigger → HTTP Request (POST /api/quotes) → Email (enviar PDF)
```

### Ejemplo 4: Notificar Slack cuando llega un nuevo lead

```
Schedule Trigger (cada 15 min) → HTTP Request (GET /api/leads) → Filter (createdAt últimos 15 min) → Slack (enviar mensaje)
```

---

## 🛡️ Seguridad

### Buenas Prácticas

1. **Nunca compartas tu API key públicamente**
2. **Usa HTTPS siempre** - nunca HTTP
3. **Rota tus API keys periódicamente**
4. **Desactiva keys que no uses** desde el panel de Setup
5. **Usa credenciales de n8n** en lugar de hardcodear las keys
6. **Monitorea el uso** - revisa "Último Uso" en el panel de API Keys

### Rotar una API Key

Si crees que tu API key ha sido comprometida:

1. Ve a **Dashboard > Setup > API Keys**
2. Desactiva la key comprometida (botón **Activa/Inactiva**)
3. Crea una nueva API key
4. Actualiza la configuración en n8n con la nueva key
5. Elimina la key antigua

---

## 🔍 Troubleshooting

### Error: "API key no proporcionada"

**Solución:** Verifica que estás enviando el header `Authorization: Bearer TU_API_KEY`

### Error: "API key inválida o inactiva"

**Soluciones:**
- Verifica que copiaste correctamente la API key completa
- Asegúrate de que la key está activa en el panel de Setup
- Genera una nueva API key si es necesario

### Error 401 Unauthorized

**Soluciones:**
- Verifica que la API key es válida usando `/api/auth/validate`
- Asegúrate de incluir "Bearer " antes de la key (si usas Authorization header)
- Revisa que no haya espacios extra al copiar la key

### No recibo datos

**Soluciones:**
- Verifica que la URL del endpoint es correcta
- Usa el endpoint `/api/auth/validate` para confirmar que la autenticación funciona
- Revisa los logs en n8n para ver la respuesta completa del servidor

---

## 📞 Soporte

Si tienes problemas con la integración:

1. Verifica los logs de n8n
2. Prueba los endpoints con Postman o cURL primero
3. Revisa que tu API key está activa
4. Contacta al administrador del sistema

---

## 📚 Recursos Adicionales

- [Documentación de n8n](https://docs.n8n.io/)
- [HTTP Request Node - n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Webhook Trigger - n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

**Versión:** 1.0  
**Última actualización:** 17 de enero de 2026
