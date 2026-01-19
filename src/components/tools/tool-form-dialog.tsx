"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Herramienta } from "@/types";
import type { HerramientaFormData } from "@/lib/tools-service";

interface HerramientaFormDialogProps {
  editingHerramienta?: Herramienta | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: HerramientaFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function HerramientaFormDialog({
  editingHerramienta,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
  trigger,
}: HerramientaFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const category = ["licencia", "infraestructura", "herramienta", "otro"]
  const paytype = [
                  { value: "mensual", label: "Mensual" },
                  { value: "anual", label: "Anual" },
                  { value: "uso", label: "Por Uso" },
                  { value: "unico", label: "Pago Único" },
                ]

  const initialFormData = useMemo(
    (): HerramientaFormData => {
      if (editingHerramienta) {
        return {
          nombre: editingHerramienta.nombre || "",
          categoria: editingHerramienta.categoria || "herramienta",
          tipoCobranza: editingHerramienta.tipoCobranza || "mensual",
          costo: editingHerramienta.costo || 0,
          descripcion: editingHerramienta.descripcion || "",
          proveedor: editingHerramienta.proveedor || "",
          disponible: editingHerramienta.disponible ?? true,
        };
      }
      return {
        nombre: "",
        categoria: "herramienta",
        tipoCobranza: "mensual",
        costo: 0,
        descripcion: "",
        proveedor: "",
        disponible: true,
      };
    },
    [editingHerramienta?.id]
  );

  const [formData, setFormData] = useState<HerramientaFormData>(initialFormData);

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const resetForm = () => {
    setFormData(initialFormData);
  };

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = async () => {
    try {
      await onSubmit(formData, editingHerramienta?.id);
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar herramienta:", error);
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
            Nueva Herramienta
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingHerramienta ? "Editar Herramienta" : "Nueva Herramienta"}
          </DialogTitle>
          <DialogDescription>
            {editingHerramienta
              ? "Actualiza la información de la herramienta"
              : "Completa el formulario para crear una nueva herramienta"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid gap-2">
            <label htmlFor="nombre" className="text-sm font-medium text-white">
              Nombre
            </label>
            <Input
              id="nombre"
              value={formData.nombre || ""}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: AWS EC2, MongoDB Atlas, Stripe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="categoria" className="text-sm font-medium text-white">
                Categoría
              </label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({
                    ...formData,
                    categoria: e.target.value as HerramientaFormData["categoria"],
                    })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-background text-gray-900 dark:text-gray-100 px-3 py-1 text-sm [&>option]:text-black"
                  >
                  {category.map((cat) => (
                    <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="tipoCobranza" className="text-sm font-medium text-white">
                Tipo de Cobranza
              </label>
                <select
                  id="tipoCobranza"
                  value={formData.tipoCobranza}
                  onChange={(e) =>
                  setFormData({
                  ...formData,
                  tipoCobranza: e.target.value as HerramientaFormData["tipoCobranza"],
                  })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-background text-gray-900 dark:text-gray-100 px-3 py-1 text-sm [&>option]:text-black"
                  >
                  {paytype.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                  </option>
                  ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="costo" className="text-sm font-medium text-white">
                Costo
              </label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                value={formData.costo ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costo: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="proveedor" className="text-sm font-medium text-white">
                Proveedor (opcional)
              </label>
              <Input
                id="proveedor"
                value={formData.proveedor || ""}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
                placeholder="Ej: AWS, Google, Stripe"
              />
            </div>
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
              placeholder="Breve descripción de la herramienta"
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
            {editingHerramienta ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
