"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { QuotesTable } from "@/components/quotes/quotes-table";
import { QuoteFormDialog } from "@/components/quotes/quote-form-dialog";
import { QuoteContentDialog } from "@/components/quotes/quote-content-dialog";
import { DeleteQuoteDialog } from "@/components/quotes/delete-quote-dialog";
import { quotesService, type Quote } from "@/lib/quotes-service";
import { projectsService } from "@/lib/projects-service";
import { useToast } from "@/hooks/use-toast";
import { useQuoteForm } from "@/hooks/use-quote-form";
import { Plus } from "lucide-react";

export default function QuotesPage() {
  const {
    quotes, leads, loading, dialogOpen, setDialogOpen,
    deleteDialogOpen, setDeleteDialogOpen, editingId, setEditingId,
    deletingId, setDeletingId, initialFormData,
    handleCreate, handleEdit, handleSave, loadAllData
  } = useQuoteForm();
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);

  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewContent = (quote: Quote) => {
    setViewingQuote(quote);
    setContentDialogOpen(true);
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
        onViewContent={handleViewContent}
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

      {isClient && (
        <QuoteContentDialog
          open={contentDialogOpen}
          onOpenChange={setContentDialogOpen}
          quote={viewingQuote}
        />
      )}
    </div>
  );
}