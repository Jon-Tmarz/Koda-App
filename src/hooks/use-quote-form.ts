import { useState, useEffect, useCallback } from "react";
import { quotesService, type Quote } from "@/lib/quotes-service";
import { leadsService } from "@/lib/leads-service";
import { projectsService } from "@/lib/projects-service";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/types";
import type { QuoteFormData } from "@/components/quotes/quote-form-dialog";

const BLANK_QUOTE: QuoteFormData = {
  numero: "",
  titulo: "",
  contenido: "",
  cliente: "",
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0,
  estado: "borrador",
};

export function useQuoteForm() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<QuoteFormData>(BLANK_QUOTE);
  const { toast } = useToast();

  const loadAllData = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
        titulo: quoteToEdit.titulo || "",
        contenido: quoteToEdit.contenido || "",
        cliente: quoteToEdit.clienteId,
        items: quoteToEdit.items.map(item => ({ ...item, cargo: item.cargo || undefined })),
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
      throw error;
    }
  };

  return { quotes, leads, loading, dialogOpen, setDialogOpen, deleteDialogOpen, setDeleteDialogOpen, editingId, setEditingId, deletingId, setDeletingId, initialFormData, handleCreate, handleEdit, handleSave, loadAllData };
}