// API Route para inicializar Firestore con datos por defecto
import { NextResponse } from "next/server";
import {
  checkFirestoreConnection,
  initializeFirestoreData,
} from "@/lib/firestore-services";

export async function GET() {
  try {
    // Primero verificar conexión
    const connectionResult = await checkFirestoreConnection();
    
    if (!connectionResult.connected) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo conectar a Firestore",
          details: connectionResult.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conexión a Firestore verificada",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Verificar conexión primero
    const connectionResult = await checkFirestoreConnection();
    
    if (!connectionResult.connected) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo conectar a Firestore",
          details: connectionResult.message,
        },
        { status: 503 }
      );
    }

    // Inicializar datos
    const initResult = await initializeFirestoreData();

    if (!initResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: initResult.message,
          details: initResult.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: initResult.message,
      details: initResult.details,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
