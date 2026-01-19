"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Lead } from "@/types";
import { createLead, updateLead } from "@/lib/firestore-services";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSuccess: () => void;
}

const estadosOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "negociacion", label: "Negociación" },
  { value: "cerrado", label: "Cerrado" },
  { value: "perdido", label: "Perdido" },
];

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: LeadFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    empresa: string;
    contacto: string;
    email: string;
    telefono: string;
    estado: "nuevo" | "contactado" | "negociacion" | "cerrado" | "perdido";
    notas: string;
  }>({
    empresa: "",
    contacto: "",
    email: "",
    telefono: "",
    estado: "nuevo",
    notas: "",
  });

  // Resetear o cargar datos cuando cambia el lead o el dialog se abre
  useEffect(() => {
    if (open) {
      if (lead) {
        setFormData({
          empresa: lead.empresa || "",
          contacto: lead.contacto || "",
          email: lead.email || "",
          telefono: lead.telefono || "",
          estado: lead.estado || "nuevo",
          notas: lead.notas || "",
        });
      } else {
        setFormData({
          empresa: "",
          contacto: "",
          email: "",
          telefono: "",
          estado: "nuevo",
          notas: "",
        });
      }
    }
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (lead?.id) {
        await updateLead(lead.id, formData);
      } else {
        await createLead(formData);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error guardando lead:", error);
      alert(error instanceof Error ? error.message : "Error al guardar el lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] my-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {lead ? "Editar Lead" : "Nuevo Lead"}
            </DialogTitle>
            <DialogDescription>
              {lead
                ? "Actualiza la información del lead"
                : "Agrega un nuevo lead al sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Empresa */}
            <div className="grid gap-2">
              <Label htmlFor="empresa">
                Empresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) =>
                  setFormData({ ...formData, empresa: e.target.value })
                }
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            {/* Contacto */}
            <div className="grid gap-2">
              <Label htmlFor="contacto">
                Contacto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) =>
                  setFormData({ ...formData, contacto: e.target.value })
                }
                placeholder="Nombre del contacto"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@empresa.com"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="+57 300 123 4567"
              />
            </div>

            {/* Estado */}
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger className="text-gray-100">
                  <SelectValue placeholder="Selecciona un estado" className="text-gray-100" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900">
                  {estadosOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-100">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="grid gap-2">
              <Label htmlFor="notas">Notas</Label>
              <textarea
                id="notas"
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                placeholder="Notas adicionales sobre el lead..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-100"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="outline" disabled={loading} className="text-gray-100">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lead ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
