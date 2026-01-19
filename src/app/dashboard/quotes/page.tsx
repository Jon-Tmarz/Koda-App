"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuoteFormDialog } from "@/components/quotes/quote-form-dialog";
import { DeleteQuoteDialog } from "@/components/quotes/delete-quote-dialog";
import { QuotesTable } from "@/components/quotes/quotes-table";
import { cotizacionesService, type Cotizacion, type CotizacionFormData } from "@/lib/cotizaciones-service";

export default function QuotesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CotizacionFormData>({
    numero: "",
    cliente: "",
    items: [{ descripcion: "", horas: 0, costoPorHora: 0, subtotal: 0 }],
    subtotal: 0,
    iva: 0,
    total: 0,
    estado: "borrador",
    pdfUrl: "",
  });

  const loadCotizaciones = async () => {
    try {
      setLoading(true);
      const data = await cotizacionesService.getAll();
      setCotizaciones(data);
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCotizaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateQuote = async (data: CotizacionFormData) => {
    try {
      setSaving(true);
      const numero = data.numero || cotizacionesService.generarNumero(cotizaciones.length);
      await cotizacionesService.create({ ...data, numero, fecha: Timestamp.now() });
      
      toast({
        title: "Éxito",
        description: "Cotización creada correctamente",
      });
      
      resetForm();
      loadCotizaciones();
    } catch (error) {
      console.error("Error creando cotización:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cotización",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: CotizacionFormData) => {
    if (!editingId) return;
    try {
      setSaving(true);
      await cotizacionesService.update(editingId, data);
      
      toast({
        title: "Éxito",
        description: "Cotización actualizada correctamente",
      });
      
      resetForm();
      loadCotizaciones();
    } catch (error) {
      console.error("Error actualizando cotización:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cotización",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (data: CotizacionFormData) => {
    // Validaciones
    if (!data.numero) {
      toast({
        title: "Error de validación",
        description: "El número de cotización es requerido",
        variant: "destructive",
      });
      return;
    }
    
    const hasInvalidItems = data.items.some(
      item => !item.descripcion || item.horas <= 0 || item.costoPorHora <= 0
    );
    
    if (hasInvalidItems) {
      toast({
        title: "Error de validación",
        description: "Todos los items deben tener descripción, horas y costo válidos",
        variant: "destructive",
      });
      return;
    }
    
    if (editingId) {
      handleUpdate(data);
    } else {
      handleCreateQuote(data);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await cotizacionesService.delete(deletingId);
      
      toast({
        title: "Éxito",
        description: "Cotización eliminada correctamente",
      });
      
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadCotizaciones();
    } catch (error) {
      console.error("Error eliminando cotización:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cotización",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string) => {
    const cotizacion = cotizaciones.find((c) => c.id === id);
    if (!cotizacion) return;

    setEditingId(id);
    setFormData({
      numero: cotizacion.numero,
      cliente: "",
      items: cotizacion.items || [{ descripcion: "", horas: 0, costoPorHora: 0, subtotal: 0 }],
      subtotal: cotizacion.subtotal,
      iva: cotizacion.iva,
      total: cotizacion.total,
      estado: cotizacion.estado,
      pdfUrl: "",
    });
    setDialogOpen(true);
  };

  const handleDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleCreateNew = async () => {
    resetForm();
    const numero = cotizacionesService.generarNumero(cotizaciones.length);
    setFormData((prev) => ({ ...prev, numero }));
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      cliente: "",
      items: [{ descripcion: "", horas: 0, costoPorHora: 0, subtotal: 0 }],
      subtotal: 0,
      iva: 0,
      total: 0,
      estado: "borrador",
      pdfUrl: "",
    });
    setEditingId(null);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cotizaciones</h2>
          <p className="text-muted-foreground">
            Historial de cotizaciones generadas
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Lista de Cotizaciones</CardTitle>
          <CardDescription>
            {cotizaciones.length} cotización(es) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuotesTable
            cotizaciones={cotizaciones}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteDialog}
            onCreate={handleCreateNew}
          />
        </CardContent>
      </Card>

      <QuoteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        initialData={formData}
        onSave={handleSave}
        onCancel={resetForm}
        saving={saving}
      />

      <DeleteQuoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
