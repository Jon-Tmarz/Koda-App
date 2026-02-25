"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { colaboradorSchema, type ColaboradorFormData } from "@/lib/colaboradores-service";
import type { Colaborador } from "@/types";

interface ColaboradorFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingColaborador?: Colaborador | null;
  onSubmit: (data: ColaboradorFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ColaboradorFormDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  editingColaborador,
  onSubmit,
  trigger,
}: ColaboradorFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const form = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      nombre: "",
      cargo: "",
      email: "",
      telefono: "",
      fechaIngreso: new Date(),
      salario: 0,
      estado: "Activo",
      notas: "",
    },
  });

  const { register, handleSubmit, formState: { isSubmitting, errors }, reset } = form;

  const dateToInputValue = (date: Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (dialogOpen) {
      if (editingColaborador) {
        const values = {
          ...editingColaborador,
          fechaIngreso: new Date(editingColaborador.fechaIngreso),
        };
        // @ts-ignore
        values.fechaIngreso = dateToInputValue(values.fechaIngreso);
        reset(values);
      } else {
        reset({
          nombre: "",
          cargo: "",
          email: "",
          telefono: "",
          // @ts-ignore
          fechaIngreso: dateToInputValue(new Date()),
          salario: 0,
          estado: "Activo",
          notas: "",
        });
      }
    }
  }, [editingColaborador, dialogOpen, reset]);

  async function onValidSubmit(data: ColaboradorFormData) {
    try {
      await onSubmit(data, editingColaborador?.id);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error guardando colaborador:", error);
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
            Nuevo Colaborador
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">
            <span className="text-black">{editingColaborador ? "Editar Colaborador" : "Nuevo Colaborador"}</span>
          </DialogTitle>
          <DialogDescription>
            {editingColaborador ? "Actualiza los datos del colaborador" : "Agrega un nuevo colaborador activo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValidSubmit)}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo <span className="text-red-500">*</span></Label>
                <Input id="nombre" {...register("nombre")} placeholder="Juan Pérez" />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo <span className="text-red-500">*</span></Label>
                <Input id="cargo" {...register("cargo")} placeholder="Desarrollador Senior" />
                {errors.cargo && <p className="text-sm text-red-500">{errors.cargo.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" {...register("email")} placeholder="juan.perez@empresa.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" {...register("telefono")} placeholder="+57 300 123 4567" />
                {errors.telefono && <p className="text-sm text-red-500">{errors.telefono.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaIngreso">Fecha de Ingreso <span className="text-red-500">*</span></Label>
                <Input id="fechaIngreso" type="date" {...register("fechaIngreso")} />
                {errors.fechaIngreso && <p className="text-sm text-red-500">{errors.fechaIngreso.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salario">Salario Mensual <span className="text-red-500">*</span></Label>
                <Input id="salario" type="number" {...register("salario")} placeholder="3000000" />
                {errors.salario && <p className="text-sm text-red-500">{errors.salario.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <select id="estado" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register("estado")}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errors.estado && <p className="text-sm text-red-500">{errors.estado.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea id="notas" {...register("notas")} placeholder="Información adicional del colaborador..." />
              {errors.notas && <p className="text-sm text-red-500">{errors.notas.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>) : (editingColaborador ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}