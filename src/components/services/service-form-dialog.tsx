"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import type { Servicio, Herramienta } from "@/types";
import type { ServicioFormData } from "@/lib/servicios-service";
import { herramientasService } from "@/lib/tools-service";

interface ServiceFormDialogProps {
  editingService?: Servicio | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: ServicioFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ServiceFormDialog({
  editingService,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
  trigger,
}: ServiceFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [herramientasDisponibles, setHerramientasDisponibles] = useState<Herramienta[]>([]);
  
  const initialFormData = useMemo((): ServicioFormData => {
    if (editingService) {
      return {
        nombre: editingService.nombre || "",
        categoria: editingService.categoria || "",
        tecnologias: editingService.tecnologias || [],
        descripcion: editingService.descripcion || "",
        disponible: editingService.disponible ?? true,
      };
    }
    return {
      nombre: "",
      categoria: "",
      tecnologias: [],
      descripcion: "",
      disponible: true,
    };
  }, [editingService?.id]);

  const [formData, setFormData] = useState<ServicioFormData>(initialFormData);

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const resetForm = () => {
    setFormData(initialFormData);
  };

  // Update form when editingService changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Cargar herramientas disponibles
  useEffect(() => {
    const loadHerramientas = async () => {
      try {
        const data = await herramientasService.getDisponibles();
        setHerramientasDisponibles(data);
      } catch (error) {
        console.error("Error cargando herramientas:", error);
      }
    };
    loadHerramientas();
  }, []);

  const handleSubmit = async () => {
    try {
      await onSubmit(formData, editingService?.id);
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingService ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription>
            {editingService
              ? "Actualiza la información del servicio"
              : "Completa el formulario para crear un nuevo servicio"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid gap-2">
            <label htmlFor="nombre" className="text-sm font-medium text-white">
              Nombre del Servicio
            </label>
            <Input
              id="nombre"
              value={formData.nombre || ""}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Desarrollo WordPress"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="categoria" className="text-sm font-medium text-white">
              Categoría
            </label>
            <Input
              id="categoria"
              value={formData.categoria || ""}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              placeholder="Ej: Desarrollo Web"
            />
          </div>
          
          {/* Selector de Herramientas */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white">
              Herramientas Tecnológicas
            </label>
            <div className="border rounded-lg p-3 bg-background">
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.isArray(formData.tecnologias) && formData.tecnologias.length > 0 ? (
                  formData.tecnologias.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => {
                          const newTecnologias = formData.tecnologias.filter((_, i) => i !== index);
                          setFormData({ ...formData, tecnologias: newTecnologias });
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
              <select
                className="w-full rounded-lg border border-input bg-background text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const currentTechs = Array.isArray(formData.tecnologias) ? formData.tecnologias : [];
                    if (!currentTechs.includes(e.target.value)) {
                      setFormData({
                        ...formData,
                        tecnologias: [...currentTechs, e.target.value],
                      });
                    }
                  }
                }}
              >
                <option value="">Selecciona una herramienta...</option>
                {herramientasDisponibles.map((herramienta) => (
                  <option key={herramienta.id} value={herramienta.nombre}>
                    {herramienta.nombre} - {herramienta.categoria}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400">
              Selecciona las herramientas que dominas para este servicio. Solo aparecen las activas en tu catálogo.
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="descripcion" className="text-sm font-medium text-white">
              Descripción (opcional)
            </label>
            <Input
              id="descripcion"
              value={formData.descripcion || ""}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Breve descripción del servicio"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="disponible"
              type="checkbox"
              checked={formData.disponible}
              onChange={(e) =>
                setFormData({ ...formData, disponible: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="disponible" className="text-sm font-medium text-white">
              Disponible
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSubmit} className="text-white">
            {editingService ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
