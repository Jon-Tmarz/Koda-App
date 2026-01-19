"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function FirestoreStatusCard() {
  const [initializingData, setInitializingData] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<{
    connected: boolean;
    message: string;
    checked: boolean;
  }>({
    connected: false,
    message: "Verificando conexión...",
    checked: false,
  });
  const [initResult, setInitResult] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, string>;
  } | null>(null);

  const checkFirestoreConnection = async () => {
    try {
      const response = await fetch("/api/firestore/init");
      const data = await response.json();
      setFirestoreStatus({
        connected: data.success,
        message: data.success
          ? "Conexión exitosa"
          : data.error || "Error de conexión",
        checked: true,
      });
    } catch (error) {
      setFirestoreStatus({
        connected: false,
        message: error instanceof Error ? error.message : "Error de conexión",
        checked: true,
      });
    }
  };

  const initializeData = async () => {
    try {
      setInitializingData(true);
      setInitResult(null);
      const response = await fetch("/api/firestore/init", {
        method: "POST",
      });
      const data = await response.json();
      setInitResult({
        success: data.success,
        message: data.success ? data.message : data.error,
        details: data.details,
      });
      if (data.success) {
        await checkFirestoreConnection();
      }
    } catch (error) {
      setInitResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setInitializingData(false);
    }
  };

  useEffect(() => {
    checkFirestoreConnection();
  }, []);

  return (
    <Card className="border-border/40 max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Firestore
        </CardTitle>
        <CardDescription>
          Verifica la conexión e inicializa los datos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {!firestoreStatus.checked ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : firestoreStatus.connected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span
            className={
              firestoreStatus.connected
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {firestoreStatus.message}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkFirestoreConnection}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Inicializa los datos base del sistema: configuración de salarios
            2025, cargos, servicios de ejemplo, etc.
          </p>
          <Button
            onClick={initializeData}
            disabled={initializingData || !firestoreStatus.connected}
          >
            {initializingData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Inicializar Datos
              </>
            )}
          </Button>
        </div>

        {initResult && (
          <div
            className={`p-4 rounded-lg ${
              initResult.success
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <p
              className={`font-medium ${
                initResult.success
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {initResult.message}
            </p>
            {initResult.details && (
              <ul className="mt-2 text-sm space-y-1">
                {Object.entries(initResult.details).map(([key, value]) => (
                  <li key={key} className="text-muted-foreground">
                    • <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
