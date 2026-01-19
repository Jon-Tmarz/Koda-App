// src/app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAPIKey } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await verifyAPIKey(request);

  if (!auth.valid) {
    return NextResponse.json(
      { 
        valid: false,
        error: auth.error 
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    message: "API key válida",
    apiKeyId: auth.apiKeyId,
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
