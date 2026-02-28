"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotePDFTemplate } from './quote-pdf-template';
import { PDFViewer } from '@react-pdf/renderer';
import type { Quote } from "@/lib/quotes-service";

interface QuoteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  logoUrl?: string;
}

export function QuoteContentDialog({ open, onOpenChange, quote, logoUrl }: QuoteContentDialogProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // El PDFViewer solo debe renderizarse en el cliente para evitar errores de SSR.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Resetea la pestaña activa al abrir el diálogo
    if (open) {
      setActiveTab('content');
    }
  }, [open]);


  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">{quote.titulo || `Detalles de Cotización ${quote.numero}`}</DialogTitle>
          <DialogDescription>Cliente: {quote.clienteNombre}</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="pdf">Vista Previa PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="flex-grow overflow-y-auto mt-4 rounded-md border p-4">
            <div className="prose dark:prose-invert max-w-none py-4"
                 dangerouslySetInnerHTML={{ __html: quote.contenido || "<p>No hay contenido detallado para esta cotización.</p>" }}
            />
          </TabsContent>
          <TabsContent value="pdf" className="flex-grow mt-2 border rounded-md">
            {/* Renderizamos el PDF solo si la pestaña está activa y estamos en el cliente */}
            {isClient && activeTab === 'pdf' ? (
              <PDFViewer width="100%" height="100%" className="rounded-md">
                <QuotePDFTemplate quote={quote} logoUrl={logoUrl} />
              </PDFViewer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                  <p>Generando vista previa del PDF...</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}