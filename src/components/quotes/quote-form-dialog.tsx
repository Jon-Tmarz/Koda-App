"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { type Lead, type Servicio, type CargoTipo, DEFAULT_SALARIO_CONFIG } from "@/types";
import { serviciosService } from "@/lib/servicios-service";
import { calcularSalarioCompleto } from "@/lib/salarios";
import { useSalarios } from "@/hooks/use-salarios";
import { QuoteItemCreator } from "./quote-item-creator";
import { QuoteDetailsDialog } from "./quote-details-dialog";

const quoteItemSchema = z.object({
  descripcion: z.string().min(1, "La descripción es requerida."),
  cargo: z.string().optional(),
  horas: z.coerce.number().min(0.1, "Las horas deben ser positivas."),
  costoPorHora: z.coerce.number().min(0, "El costo por hora no puede ser negativo."),
  subtotal: z.number().default(0),
});

export const quoteFormSchema = z.object({
  numero: z.string(),
  titulo: z.string().min(1, "El título del proyecto es requerido."),
  cliente: z.string().min(1, "Debe seleccionar un cliente."),
  items: z.array(quoteItemSchema).min(1, "Debe haber al menos un item."),
  subtotal: z.number().default(0),
  iva: z.number().default(0),
  total: z.number().default(0),
  contenido: z.string().min(8, "El contenido del proyecto es requerido (debe tener más que un párrafo vacío)."),
  estado: z.enum(["borrador", "enviada", "aprobada", "rechazada"]),
  pdfUrl: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingId: string | null;
  leads: Lead[];
  initialData: QuoteFormData;
  onSave: (data: QuoteFormData) => Promise<void>;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

const statusOptions = [
  {
    value: "borrador",
    label: "Borrador",
    icon: <AlertCircle className="h-3 w-3 mr-2 text-gray-500" />,
  },
  {
    value: "enviada",
    label: "Enviada",
    icon: <AlertCircle className="h-3 w-3 mr-2 text-blue-500" />,
  },
  {
    value: "aprobada",
    label: "Aprobada",
    icon: <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />,
  },
  {
    value: "rechazada",
    label: "Rechazada",
    icon: <XCircle className="h-3 w-3 mr-2 text-red-500" />,
  },
] as const;

export function QuoteFormDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  editingId,
  leads,
  initialData,
  onSave,
  onCancel,
  trigger,
}: QuoteFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { config: salarioConfig, multipliers, fetchLatestConfig } = useSalarios();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange! : setInternalOpen;
  const itemsAdd = [{title: "Descripción", class: "col-span-2"}, {title: "Horas", class: "text-center"}, {title: "Costo/Hora", class: "text-right"}, {title: "Costo Total", class: "text-right"}]

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const data = await serviciosService.getDisponibles();
        setServicios(data);
      } catch (error) {
        console.error("Error al cargar los servicios:", error);
      }
    };

    fetchServicios();
    fetchLatestConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchLatestConfig is memoized by useCallback

  console.log("Servicios disponibles:", servicios);

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  useEffect(() => {
    // El costoPorHora ya incluye IVA. La suma de los items es el TOTAL.
    const totalConIva = watchedItems.reduce((sum, item) => sum + ((item.horas || 0) * (item.costoPorHora || 0)), 0);
    
    // Calculamos el subtotal (base) a partir del total.
    const subtotalBase = totalConIva / (1 + (DEFAULT_SALARIO_CONFIG.iva / 100));
    const subtotalRedondeado = Math.round(subtotalBase / 100) * 100;
    const iva = subtotalRedondeado * (DEFAULT_SALARIO_CONFIG.iva / 100);
    const total = Math.ceil((subtotalRedondeado + iva)/100) * 100; // Redondeamos el total al múltiplo de 100 más cercano

    setValue("subtotal", subtotalRedondeado, { shouldValidate: true });
    setValue("iva", iva);
    setValue("total", total);

    watchedItems.forEach((item, index) => {
      const itemSubtotal = item.horas * item.costoPorHora;
      if (item.subtotal !== itemSubtotal) {
        setValue(`items.${index}.subtotal`, itemSubtotal);
      }
    });
  }, [watchedItems, setValue]);

  useEffect(() => {
    if (open) {
      const resetData = { ...initialData, items: initialData.items.map(item => ({ ...item, cargo: item.cargo || undefined })) };
      form.reset(resetData);
    }
  }, [initialData, open, form]);

  const handleAddItem = (item: z.infer<typeof quoteItemSchema>) => {
    append(item);
  };
  const removeItem = (index: number) => {
    remove(index);
  };

  const handleSaveDetails = (details: { titulo: string; contenido: string }) => {
    setValue("titulo", details.titulo);
    setValue("contenido", details.contenido);
  };

  const calculateAndUpdateCost = (itemIndex: number, cargo: CargoTipo | undefined) => {
    if (!salarioConfig || !multipliers || !cargo) {
      setValue(`items.${itemIndex}.costoPorHora`, 0, { shouldValidate: true });
      return;
    }
  
    try {
      const resultado = calcularSalarioCompleto(salarioConfig, cargo, multipliers);
      const costoHora = resultado.porHora.totalPorHora;
      setValue(`items.${itemIndex}.costoPorHora`, Math.round(costoHora), { shouldValidate: true });
    } catch (e) {
      console.error(`No se pudo calcular el costo para el cargo: ${cargo}`, e);
      setValue(`items.${itemIndex}.costoPorHora`, 0, { shouldValidate: true });
    }
  };

  async function onValidSubmit(data: QuoteFormData) {
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent page with a toast
    }
  }

  const handleCancel = () => {
    onOpenChange(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && !open && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <span className="text-black">
              {editingId ? "Editar Cotización" : "Nueva Cotización"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Modifica los datos de la cotización existente"
              : "Completa los datos para crear una nueva cotización"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValidSubmit)} className="grid gap-6 py-4">
          {/* Información básica */}
          <div className="space-y-4 ">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-black">
                  Información General
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Datos básicos de la cotización y detalles del proyecto.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailsDialogOpen(true)}
              >
                Detalles del Proyecto
              </Button>
            </div>
            {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero" className="text-foreground">
                  N° Cotización
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  readOnly
                  placeholder="Se genera automáticamente"
                  className="font-mono bg-muted cursor-not-allowed"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cliente" className="text-foreground">
                  Cliente *
                </Label>
                <Controller
                  name="cliente"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger id="cliente">
                        <SelectValue placeholder="Selecciona un cliente..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id!}>
                            {lead.empresa && lead.contacto ? `${lead.empresa} (${lead.contacto})` : lead.empresa || lead.contacto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cliente && <p className="text-sm text-red-500">{errors.cliente.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado" className="text-foreground">
                  Estado
                </Label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger id="estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              {option.icon}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Items de la cotización */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-black">
                  Items de la cotización
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Agrega los servicios o productos de esta cotización
                </p>
              </div>
            </div>
            {errors.contenido && <p className="text-sm text-red-500">{errors.contenido.message}</p>}

            <QuoteItemCreator
              servicios={servicios}
              salarioConfig={salarioConfig}
              multipliers={multipliers}
              onAddItem={handleAddItem}
            />

            {fields.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-medium text-black">Items Agregados</h4>
                <div className="flex items-center justify-between gap-4 px-3 mt-2 pb-1 border-b">
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center text-xs font-semibold text-muted-foreground">
                    {itemsAdd.map((header, index) => (
                      <span key={index} className={header.class}>
                        {header.title}
                      </span>
                    ))}
                  </div>
                  <div className="w-8 h-1"></div> {/* Placeholder for delete icon */}
                </div>
                {fields.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-muted/50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <span className="col-span-2 font-medium text-sm truncate" title={item.descripcion}>
                          {item.descripcion}
                          {item.cargo && <span className="text-xs text-muted-foreground ml-2">({item.cargo})</span>}
                        </span>
                        <span className="text-sm tabular-nums text-center">{item.horas}h</span>
                        <span className="text-sm tabular-nums text-right">
                          ${(item.costoPorHora || 0).toLocaleString("es-CO")}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-right">
                          ${((item.horas || 0) * (item.costoPorHora || 0)).toLocaleString("es-CO")}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {errors.items && <p className="text-sm text-red-500">{errors.items.message || errors.items.root?.message}</p>}
          </div>

          {/* Totales */}
          <Card className="p-6 border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-black">
                  Subtotal:
                </span>
                <span className="text-lg tabular-nums font-semibold text-black">
                  $
                  {watch("subtotal").toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  IVA (19%):
                </span>
                <span className="text-base tabular-nums font-medium text-gray-600 dark:text-gray-400">
                  $
                  {watch("iva").toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-black">
                  Total:
                </span>
                <span className="text-3xl font-bold tabular-nums text-primary text-black">
                  $
                  {watch("total").toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{editingId ? "Actualizar" : "Crear"} Cotización</>
              )}
            </Button>
          </DialogFooter>
        </form>

        <QuoteDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          initialTitle={watch("titulo")}
          initialContent={watch("contenido")}
          onSave={handleSaveDetails}
        />
      </DialogContent>
    </Dialog>
  );
}
