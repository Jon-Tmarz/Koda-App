"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Herramienta, CATEGORIAS_HERRAMIENTA, TIPOS_COBRANZA, TIPO_COBRANZA_LABELS, DIVISAS, } from "@/types";
import type { HerramientaFormData } from "@/lib/tools-service";

interface HerramientaFormDialogProps {
  editingHerramienta?: Herramienta | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: HerramientaFormData, editingId?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

const formSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  categoria: z.enum(CATEGORIAS_HERRAMIENTA),
  tipoCobranza: z.enum(TIPOS_COBRANZA),
  costo: z.coerce.number().min(0, { message: "El costo no puede ser negativo." }),
  divisa: z.enum(DIVISAS),
  descripcion: z.string().optional(),
  proveedor: z.string().optional(),
  disponible: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;


export function HerramientaFormDialog({
  editingHerramienta,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
  trigger,
}: HerramientaFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const categoriaOptions = CATEGORIAS_HERRAMIENTA.map((cat) => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
  }));

  const tipoCobranzaOptions = TIPOS_COBRANZA.map((tipo) => ({
    value: tipo,
    label: TIPO_COBRANZA_LABELS[tipo],
  }));

  const divisaOptions = DIVISAS.map((d) => ({ 
    value: d, 
    label: d 
  }));

  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      categoria: "Software",
      tipoCobranza: "mensual",
      costo: 0,
      divisa: "USD",
      descripcion: "",
      proveedor: "",
      disponible: true,
    },
  });

  const { formState: { isSubmitting, errors } } = form;

  useEffect(() => {
    if (dialogOpen) {
      if (editingHerramienta) {
        form.reset({
          nombre: editingHerramienta.nombre || "",
          categoria: editingHerramienta.categoria || "Software",
          tipoCobranza: editingHerramienta.tipoCobranza || "mensual",
          costo: editingHerramienta.costo || 0,
          divisa: editingHerramienta.divisa || "USD",
          descripcion: editingHerramienta.descripcion || "",
          proveedor: editingHerramienta.proveedor || "",
          disponible: editingHerramienta.disponible ?? true,
        });
      } else {
        form.reset();
      }
    }
  }, [editingHerramienta, dialogOpen, form]);

  async function onValidSubmit(data: FormValues) {
    try {
      await onSubmit(data, editingHerramienta?.id);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar herramienta:", error);
    }
  }

  async function onAddAnother(data: FormValues) {
    try {
      await onSubmit(data, editingHerramienta?.id);
      // Limpiar el formulario sin cerrar el dialog
      form.reset({
        nombre: "",
        categoria: "Software",
        tipoCobranza: "mensual",
        costo: 0,
        divisa: "USD",
        descripcion: "",
        proveedor: "",
        disponible: true,
      });
    } catch (error) {
      console.error("Error al guardar herramienta:", error);
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
            Nueva Herramienta
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle style={{ color: "black" }}>
            {editingHerramienta ? "Editar Herramienta" : "Nueva Herramienta"}
          </DialogTitle>
          <DialogDescription>
            {editingHerramienta
              ? "Actualiza la información de la herramienta"
              : "Completa el formulario para crear una nueva herramienta"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onValidSubmit)}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <label htmlFor="nombre" className="text-sm font-medium text-black">
                Nombre
              </label>
              <Input
                id="nombre"
                {...form.register("nombre")}
                placeholder="Ej: AWS EC2, MongoDB Atlas, Stripe"
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="categoria" className="text-sm font-medium text-black">
                  Categoría
                </label>
                  <Controller
                    name="categoria"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriaOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoria && <p className="text-sm text-red-500">{errors.categoria.message}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="tipoCobranza" className="text-sm font-medium text-black">
                  Tipo de Pago
                </label>
                  <Controller
                    name="tipoCobranza"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoCobranzaOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipoCobranza && <p className="text-sm text-red-500">{errors.tipoCobranza.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 ">
                <label htmlFor="costo" className="text-sm font-medium text-black ">
                  Costo y Divisa
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="costo"
                    type="number"
                    step="0.01"
                    {...form.register("costo")}
                    placeholder="0.00"
                    className="w-2/3"
                  />
                  <Controller
                    name="divisa"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-1/3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {divisaOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.costo && <p className="text-sm text-red-500">{errors.costo.message}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="proveedor" className="text-sm font-medium text-black">
                  Proveedor (opcional)
                </label>
                <Input
                  id="proveedor"
                  {...form.register("proveedor")}
                  placeholder="Ej: AWS, Google, Stripe"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="descripcion" className="text-sm font-medium text-black">
                Descripción (opcional)
              </label>
              <Input
                id="descripcion"
                {...form.register("descripcion")}
                placeholder="Breve descripción de la herramienta"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="disponible"
                type="checkbox"
                {...form.register("disponible")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-black">
                Disponible
              </label>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            {!editingHerramienta && (
              <Button 
                type="button" 
                variant="outline" 
                className="text-black" 
                disabled={isSubmitting}
                onClick={form.handleSubmit(onAddAnother)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  "Agregar otro"
                )}
              </Button>
            )}
            <Button type="submit" variant="outline" className="text-black" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingHerramienta ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                editingHerramienta ? "Actualizar" : "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
