// src/lib/api-auth.ts
import { NextRequest } from "next/server";
import { validateAPIKey } from "./api-keys-service";

/**
 * Extrae el API key del header de autorización
 */
export function extractAPIKey(request: NextRequest): string | null {
  // Buscar en header Authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    // Formato: "Bearer <api_key>" o solo "<api_key>"
    const match = authHeader.match(/^(?:Bearer )?(.+)$/i);
    if (match) {
      return match[1];
    }
  }

  // Buscar en header X-API-Key (alternativa común)
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Buscar en query params (no recomendado pero útil para pruebas)
  const url = new URL(request.url);
  const queryApiKey = url.searchParams.get("api_key");
  if (queryApiKey) {
    return queryApiKey;
  }

  return null;
}

/**
 * Verifica si la request tiene una API key válida
 */
export async function verifyAPIKey(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
  apiKeyId?: string;
}> {
  const apiKey = extractAPIKey(request);

  if (!apiKey) {
    return {
      valid: false,
      error: "API key no proporcionada. Incluye la key en el header 'Authorization: Bearer <tu_api_key>' o 'X-API-Key: <tu_api_key>'",
    };
  }

  const validatedKey = await validateAPIKey(apiKey);

  if (!validatedKey) {
    return {
      valid: false,
      error: "API key inválida o inactiva",
    };
  }

  return {
    valid: true,
    apiKeyId: validatedKey.id,
  };
}

/**
 * Middleware para proteger rutas API
 * Uso: const auth = await requireAPIKey(request);
 *      if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });
 */
export async function requireAPIKey(request: NextRequest) {
  return await verifyAPIKey(request);
}
