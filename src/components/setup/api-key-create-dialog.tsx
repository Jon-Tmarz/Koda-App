"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, Check, AlertCircle } from "lucide-react";
import { createAPIKey } from "@/lib/api-keys-service";

interface APIKeyCreateDialogProps {
  onKeyCreated: () => void;
}

export default function APIKeyCreateDialog({ onKeyCreated }: APIKeyCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      const result = await createAPIKey(newKeyName, newKeyDescription);
      setGeneratedKey(result.key);
      setNewKeyName("");
      setNewKeyDescription("");
      onKeyCreated();
    } catch (error) {
      console.error("Error creando API key:", error);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("Error copiando al portapapeles:", error);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setGeneratedKey(null);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button onClick={() => setGeneratedKey(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva API Key</DialogTitle>
          <DialogDescription>
            {generatedKey ? (
              "Guarda esta llave en un lugar seguro. No podrás verla de nuevo."
            ) : (
              "Crea una nueva llave de API para conectar con servicios externos."
            )}
          </DialogDescription>
        </DialogHeader>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ¡Importante! Guarda esta llave ahora
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Por seguridad, solo se muestra una vez. Cópiala y guárdala en un lugar seguro.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tu Nueva API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedKey, "generated")}
                >
                  {copiedKey === "generated" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button onClick={handleCloseDialog} className="w-full" variant="outline">
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Nombre *</Label>
              <Input
                id="keyName"
                placeholder="Ej: Integración n8n"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyDescription">Descripción</Label>
              <Input
                id="keyDescription"
                placeholder="Ej: Para automatizaciones de leads"
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreateKey}
              disabled={!newKeyName.trim() || creating}
              className="w-full"
              variant="outline"
            >
              {creating ? "Creando..." : "Generar API Key"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
