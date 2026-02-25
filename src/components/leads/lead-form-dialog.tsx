"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, LeadEstado } from "@/types";

const ESTADOS_LEAD: LeadEstado[] = ["nuevo", "contactado", "negociacion", "cerrado", "perdido"];

const formSchema = z.object({
  empresa: z.string().min(1, { message: "El nombre de la empresa es requerido." }),
  contacto: z.string().min(1, { message: "El nombre del contacto es requerido." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }).min(1, { message: "El email es requerido." }),
  telefono: z.string().optional(),
  estado: z.enum(ESTADOS_LEAD),
  notas: z.string().optional(),
});

export type LeadFormData = z.infer<typeof formSchema>;

interface LeadFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingLead?: Lead | null;
  onSubmit: (data: LeadFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

const estadosOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "negociacion", label: "Negociación" },
  { value: "cerrado", label: "Cerrado" },
  { value: "perdido", label: "Perdido" },
] as const;

export function LeadFormDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  editingLead,
  onSubmit,
  trigger,
}: LeadFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const form = useForm<LeadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa: "",
      contacto: "",
      email: "",
      telefono: "",
      estado: "nuevo",
      notas: "",
    },
  });

  const { formState: { isSubmitting, errors } } = form;

  useEffect(() => {
    if (dialogOpen) {
      if (editingLead) {
        form.reset({
          empresa: editingLead.empresa || "",
          contacto: editingLead.contacto || "",
          email: editingLead.email || "",
          telefono: editingLead.telefono || "",
          estado: editingLead.estado || "nuevo",
          notas: editingLead.notas || "",
        });
      } else {
        form.reset({
          empresa: "",
          contacto: "",
          email: "",
          telefono: "",
          estado: "nuevo",
          notas: "",
        });
      }
    }
  }, [editingLead, dialogOpen, form]);

  async function onValidSubmit(data: LeadFormData) {
    try {
      await onSubmit(data, editingLead?.id);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error guardando lead:", error);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] my-4 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              <span className="text-black">{editingLead ? "Editar Lead" : "Nuevo Lead"}</span>
            </DialogTitle>
            <DialogDescription>
              {editingLead
                ? "Actualiza la información del lead"
                : "Agrega un nuevo lead al sistema"}
            </DialogDescription>
          </DialogHeader>
        <form onSubmit={form.handleSubmit(onValidSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Empresa */}
            <div className="grid gap-2">
              <Label htmlFor="empresa">
                Empresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="empresa"
                className="text-black"
                placeholder="Nombre de la empresa"
                {...form.register("empresa")}
              />
              {errors.empresa && <p className="text-sm text-red-500">{errors.empresa.message}</p>}
            </div>

            {/* Contacto */}
            <div className="grid gap-2">
              <Label htmlFor="contacto">
                Contacto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contacto"
                className="text-black"
                placeholder="Nombre del contacto"
                {...form.register("contacto")}
              />
              {errors.contacto && <p className="text-sm text-red-500">{errors.contacto.message}</p>}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                className="text-black"
                type="email"
                placeholder="email@empresa.com"
                {...form.register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                className="text-black"
                type="tel"
                placeholder="+57 300 123 4567"
                {...form.register("telefono")}
              />
              {errors.telefono && <p className="text-sm text-red-500">{errors.telefono.message}</p>}
            </div>

            {/* Estado */}
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Controller
                name="estado"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="text-black">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {estadosOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-black">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.estado && <p className="text-sm text-red-500">{errors.estado.message}</p>}
            </div>

            {/* Notas */}
            <div className="grid gap-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Notas adicionales sobre el lead..."
                className="text-black"
                rows={3}
                {...form.register("notas")}
              />
              {errors.notas && <p className="text-sm text-red-500">{errors.notas.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="outline" disabled={isSubmitting} className="text-black">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingLead ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                editingLead ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
