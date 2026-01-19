"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Trash2 } from "lucide-react";
import { getAPIKeys, deleteAPIKey, updateAPIKey } from "@/lib/api-keys-service";
import type { APIKey } from "@/types";
import APIKeyCreateDialog from "./api-key-create-dialog";

export default function APIKeysManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const keys = await getAPIKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error("Error cargando API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta API key? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deleteAPIKey(id);
      await loadAPIKeys();
    } catch (error) {
      console.error("Error eliminando API key:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateAPIKey(id, { activa: !currentStatus });
      await loadAPIKeys();
    } catch (error) {
      console.error("Error actualizando API key:", error);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleString("es-CO");
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Gestiona las llaves de acceso para integraciones externas (n8n, Zapier, etc.)
            </CardDescription>
          </div>
          <APIKeyCreateDialog onKeyCreated={loadAPIKeys} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Cargando...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay API keys creadas. Crea una para comenzar a integrar servicios externos.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Uso</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apiKey.descripcion || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={apiKey.activa ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleActive(apiKey.id!, apiKey.activa)}
                      className="h-6 px-2 text-xs"
                    >
                      {apiKey.activa ? "Activa" : "Inactiva"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(apiKey.ultimoUso)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(apiKey.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(apiKey.id!)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
