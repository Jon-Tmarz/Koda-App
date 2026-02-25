"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Loader2 } from "lucide-react";
import { type Servicio, CATEGORIAS_HERRAMIENTA } from "@/types";
import type { ServicioFormData } from "@/lib/servicios-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceFormDialogProps {
  editingService?: Servicio | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: ServicioFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

const formSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  categoria: z.string().min(1, { message: "La categoría es requerida." }),
  tecnologias: z.array(z.string()).min(1, { message: "Selecciona al menos una herramienta." }),
  descripcion: z.string().optional(),
  disponible: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;


export function ServiceFormDialog({
  editingService,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
  trigger,
}: ServiceFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      categoria: "",
      tecnologias: [],
      descripcion: "",
      disponible: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    watch,
    setValue,
  } = form;

  // `watch` can return undefined briefly before the field is registered;
  // provide a safe empty array fallback to avoid runtime errors.
  const tecnologias = watch("tecnologias") as string[] | undefined;
  const techList = tecnologias ?? [];

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  useEffect(() => {
    if (dialogOpen) {
      if (editingService) {
        // ensure tecnologias is always an array when resetting
        reset({
          ...editingService,
          tecnologias: editingService.tecnologias ?? [],
        });
      } else {
        reset();
      }
    }
  }, [editingService, dialogOpen, reset]);

  async function onValidSubmit(data: FormValues) {
    try {
      await onSubmit(data, editingService?.id);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
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
            Nuevo Servicio
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle style={{ color: "black" }}>
        {editingService ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription >
        {editingService
          ? "Actualiza la información del servicio"
          : "Completa el formulario para crear un nuevo servicio"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValidSubmit)}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <label htmlFor="nombre" className="text-sm font-medium text-black">
                Nombre del Servicio
              </label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Ej: Desarrollo WordPress"
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
            </div>
            <div className="grid gap-2">
              <label htmlFor="categoria" className="text-sm font-medium text-black">
                Categoría
              </label>
              <Input
                id="categoria"
                {...register("categoria")}
                placeholder="Ej: Desarrollo Web"
              />
              {errors.categoria && <p className="text-sm text-red-500">{errors.categoria.message}</p>}
            </div>
            
            {/* Selector de Herramientas */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-black" htmlFor="stack-tecnologico">
                Stack Tecnológico
              </label>
              <div className="border rounded-lg p-3 bg-background">
                <div className="flex flex-wrap gap-2 mb-3">
                  {techList.length > 0 ? (
                    techList.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 text-sm">
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const newTecnologias = techList.filter((_, i) => i !== index);
                            setValue("tecnologias", newTecnologias, { shouldValidate: true });
                          }}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No hay herramientas seleccionadas
                    </p>
                  )}
                </div>
                <Select value="" onValueChange={(value) => {
                  if (value && !tecnologias.includes(value)) {
                    setValue("tecnologias", [...tecnologias, value], { shouldValidate: true });
                  }
                }}>
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Selecciona una categoría..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CATEGORIAS_HERRAMIENTA.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.tecnologias && <p className="text-sm text-red-500">{errors.tecnologias.message}</p>}
              <p className="text-xs text-gray-400">
                Selecciona las categorías de herramientas que aplican a este servicio.
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="descripcion" className="text-sm font-medium text-black">
                Descripción (opcional)
              </label>
              <Input
                id="descripcion"
                {...register("descripcion")}
                placeholder="Breve descripción del servicio"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="disponible"
                type="checkbox"
                {...register("disponible")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-black">
                Disponible
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="outline" className="text-black" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingService ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                editingService ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
