"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { QuotesTable } from "@/components/quotes/quotes-table";
import { QuoteFormDialog, type QuoteFormData } from "@/components/quotes/quote-form-dialog";
import { DeleteQuoteDialog } from "@/components/quotes/delete-quote-dialog";
import { quotesService, type Quote } from "@/lib/quotes-service";
import { leadsService } from "@/lib/leads-service";
import { projectsService } from "@/lib/projects-service";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { Lead } from "@/types";

const BLANK_QUOTE: QuoteFormData = {
  numero: "",
  cliente: "",
  items: [{ descripcion: "", horas: 1, costoPorHora: 0, subtotal: 0 }],
  subtotal: 0,
  iva: 0,
  total: 0,
  estado: "borrador",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<QuoteFormData>(BLANK_QUOTE);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [quotesData, leadsData] = await Promise.all([
        quotesService.getAll(),
        leadsService.getAll(),
      ]);
      setQuotes(quotesData);
      setLeads(leadsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
        const nextNumber = await quotesService.getNextQuoteNumber();
        setInitialFormData({ ...BLANK_QUOTE, numero: nextNumber });
        setEditingId(null);
        setDialogOpen(true);
    } catch (error) {
        console.error("Error generando número de cotización:", error);
        toast({ title: "Error", description: "No se pudo generar el número de cotización.", variant: "destructive" });
    }
  };

  const handleEdit = async (id: string) => {
    const quoteToEdit = await quotesService.getById(id);
    if (quoteToEdit) {
      setInitialFormData({
        numero: quoteToEdit.numero,
        cliente: quoteToEdit.clienteId,
        items: quoteToEdit.items,
        subtotal: quoteToEdit.subtotal,
        iva: quoteToEdit.iva,
        total: quoteToEdit.total,
        estado: quoteToEdit.estado,
        pdfUrl: quoteToEdit.pdfUrl,
      });
      setEditingId(id);
      setDialogOpen(true);
    }
  };

  const handleSave = async (data: QuoteFormData): Promise<void> => {
    // Validation is now handled by Zod in the form component.
    // We can add extra server-side-like validation here if needed.

    const selectedLead = leads.find(lead => lead.id === data.cliente);
    if (!selectedLead) {
      toast({ title: "Error", description: "El cliente seleccionado no es válido.", variant: "destructive" });
      throw new Error("Cliente no válido");
    }

    const { cliente, ...restOfData } = data;
    const submitData = {
      ...restOfData,
      clienteId: cliente,
      clienteNombre: selectedLead.empresa || selectedLead.contacto,
    };

    try {
      if (editingId) {
        await quotesService.update(editingId, submitData);
        toast({ title: "Éxito", description: "Cotización actualizada correctamente." });
      } else {
        await quotesService.create(submitData);
        toast({ title: "Éxito", description: "Cotización creada correctamente." });
      }
      setDialogOpen(false);
      await loadAllData();
    } catch (error) {
      console.error("Error guardando cotización:", error);
      toast({ title: "Error", description: "No se pudo guardar la cotización.", variant: "destructive" });
      throw error; // Re-throw to be caught by form dialog
    }
  };

  const handleStatusChange = async (id: string, estado: Quote["estado"], otro?: string) => {
    try {
      const updateData: Partial<Omit<Quote, "id" | "fecha">> = { estado };
      if (estado === "aprobada") {
        if (otro) {
          updateData.aprobacionNotas = otro;
        }
        const quoteToApprove = quotes.find(q => q.id === id);
        if (quoteToApprove) {
          await projectsService.createFromQuote(quoteToApprove);
          toast({
            title: "Proyecto Creado",
            description: `El proyecto para la cotización ${quoteToApprove.numero} ha sido iniciado.`,
          });
        }
      }

      await quotesService.update(id, updateData);
      toast({
        title: "Estado Actualizado",
        description: `La cotización ha sido actualizada a "${estado}".`,
      });
      await loadAllData();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cotización.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await quotesService.delete(deletingId);
      toast({ title: "Éxito", description: "Cotización eliminada correctamente." });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      await loadAllData();
    } catch (error) {
      console.error("Error eliminando cotización:", error);
      toast({ title: "Error", description: "No se pudo eliminar la cotización.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Cotizaciones"
        description="Crea y administra las cotizaciones para tus clientes."
      >
        {isClient && (
          <QuoteFormDialog
            editingId={null}
            initialData={initialFormData}
            leads={leads}
            onSave={handleSave}
            trigger={
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
              </Button>
            }
          />
        )}
      </PageHeader>

      <QuotesTable
        quotes={quotes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        onStatusChange={handleStatusChange}
      />

      {isClient && (
        <QuoteFormDialog
          editingId={editingId}
          initialData={initialFormData}
          leads={leads}
          onSave={handleSave}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingId(null);
          }}
        />
      )}

      {isClient && (
        <DeleteQuoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}