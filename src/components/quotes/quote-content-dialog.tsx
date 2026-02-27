"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Quote } from "@/lib/quotes-service";

interface QuoteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
}

export function QuoteContentDialog({ open, onOpenChange, quote }: QuoteContentDialogProps) {
  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">{quote.titulo || `Detalles de Cotización ${quote.numero}`}</DialogTitle>
          <DialogDescription>Cliente: {quote.clienteNombre}</DialogDescription>
        </DialogHeader>
        <div className="prose dark:prose-invert max-w-none py-4"
             dangerouslySetInnerHTML={{ __html: quote.contenido || "<p>No hay contenido detallado para esta cotización.</p>" }}
        />
      </DialogContent>
    </Dialog>
  );
}