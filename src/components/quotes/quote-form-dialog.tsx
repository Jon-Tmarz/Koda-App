"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface QuoteItem {
  descripcion: string;
  horas: number;
  costoPorHora: number;
  subtotal: number;
}

interface QuoteFormData {
  numero: string;
  cliente: string;
  items: QuoteItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: "borrador" | "enviada" | "aprobada" | "rechazada";
  pdfUrl?: string;
}

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  initialData: QuoteFormData;
  onSave: (data: QuoteFormData) => void;
  onCancel: () => void;
  saving: boolean;
}

export function QuoteFormDialog({
  open,
  onOpenChange,
  editingId,
  initialData,
  onSave,
  onCancel,
  saving,
}: QuoteFormDialogProps) {
  const [formData, setFormData] = useState<QuoteFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Calcular subtotales de items
  const calcularSubtotalItem = (horas: number, costoPorHora: number) => {
    return horas * costoPorHora;
  };

  // Calcular totales de la cotización
  const calcularTotales = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    setFormData((prev) => ({ ...prev, subtotal, iva, total }));
  }, [formData.items]);

  // Actualizar item y recalcular totales
  const updateItem = (index: number, field: string, value: unknown) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "horas" || field === "costoPorHora") {
      newItems[index].subtotal = calcularSubtotalItem(
        newItems[index].horas,
        newItems[index].costoPorHora
      );
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
    setTimeout(() => calcularTotales(), 0);
  };

  // Agregar nuevo item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { descripcion: "", horas: 0, costoPorHora: 0, subtotal: 0 }],
    }));
  };

  // Eliminar item
  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
    setTimeout(() => calcularTotales(), 0);
  };

  useEffect(() => {
    calcularTotales();
  }, [calcularTotales]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">
        {editingId ? "Editar Cotización" : "Nueva Cotización"}
        </DialogTitle>
        <DialogDescription>
        {editingId
          ? "Modifica los datos de la cotización existente"
          : "Completa los datos para crear una nueva cotización"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Información básica */}
        <div className="space-y-4">
        <div className="pb-2 border-b border-border">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Información General</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Datos básicos de la cotización</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="numero" className="text-foreground">N° Cotización *</Label>
            <Input
            id="numero"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            placeholder="COT-2026-0001"
            className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estado" className="text-foreground">Estado</Label>
            <Select
            value={formData.estado}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                estado: value as "borrador" | "enviada" | "aprobada" | "rechazada",
              })
            }
            >
            <SelectTrigger id="estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="borrador">
                <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-2 text-gray-500" />
                Borrador
                </div>
              </SelectItem>
              <SelectItem value="enviada">
                <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-2 text-blue-500" />
                Enviada
                </div>
              </SelectItem>
              <SelectItem value="aprobada">
                <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                Aprobada
                </div>
              </SelectItem>
              <SelectItem value="rechazada">
                <div className="flex items-center">
                <XCircle className="h-3 w-3 mr-2 text-red-500" />
                Rechazada
                </div>
              </SelectItem>
            </SelectContent>
            </Select>
          </div>
        </div>
        </div>

        {/* Items de la cotización */}
        <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Items de la cotización</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Agrega los servicios o productos de esta cotización
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <Card key={index} className="p-4 bg-background border-border">
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-2">
                <Label htmlFor={`descripcion-${index}`}>
                  Descripción *
                </Label>
                <Input
                  id={`descripcion-${index}`}
                  value={item.descripcion}
                  onChange={(e) => updateItem(index, "descripcion", e.target.value)}
                  placeholder="Ej: Desarrollo de aplicación web"
                />
                </div>
                {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                <Label htmlFor={`horas-${index}`}>
                  Horas *
                </Label>
                <Input
                  id={`horas-${index}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.horas}
                  onChange={(e) => updateItem(index, "horas", Number(e.target.value))}
                  placeholder="0"
                  className="tabular-nums"
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor={`costo-${index}`}>
                  Costo/Hora *
                </Label>
                <Input
                  id={`costo-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.costoPorHora}
                  onChange={(e) => updateItem(index, "costoPorHora", Number(e.target.value))}
                  placeholder="0.00"
                  className="tabular-nums"
                />
                </div>
                <div className="grid gap-2">
                <Label>Subtotal</Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted font-semibold tabular-nums text-gray-900 dark:text-white">
                  $
                  {item.subtotal.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                </div>
              </div>
            </div>
            </Card>
          ))}
        </div>
        </div>

        {/* Totales */}
        <Card className="p-6 border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Subtotal:</span>
            <span className="text-lg tabular-nums font-semibold text-gray-900 dark:text-white">
            $
            {formData.subtotal.toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IVA (19%):</span>
            <span className="text-base tabular-nums font-medium text-gray-600 dark:text-gray-400">
            $
            {formData.iva.toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            </span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
            <span className="text-3xl font-bold tabular-nums text-primary text-gray-900 dark:text-white">
            $
            {formData.total.toLocaleString("es-CO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            </span>
          </div>
        </div>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
        Cancelar
        </Button>
        <Button variant="outline" onClick={() => onSave(formData)} disabled={saving} className="text-yellow-100 dark:text-yellow-500">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editingId ? "Actualizando..." : "Creando..."}
          </>
        ) : (
          <>{editingId ? "Actualizar" : "Crear"} Cotización</>
        )}
        </Button>
      </DialogFooter>
    </DialogContent>
    </Dialog>
  );
}
