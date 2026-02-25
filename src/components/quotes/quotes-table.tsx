"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Pencil, Trash2, Loader2, AlertCircle, CheckCircle2, XCircle, Plus, ExternalLink } from "lucide-react";
import { ApproveQuoteDialog } from "./approve-quote-dialog";
import type { Quote } from "@/lib/quotes-service";

interface QuotesTableProps {
  quotes: Quote[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onStatusChange: (id: string, estado: Quote["estado"], otro?: string) => void;
}

const tableHeader = ["N° Cotización", "Cliente", "Fecha", "Subtotal", "IVA (19%)", "Total", "Estado", "Acciones"];

const statusOptions = [
  { value: "borrador", label: "Borrador", icon: <AlertCircle className="h-3 w-3 mr-2 text-gray-500" /> },
  { value: "enviada", label: "Enviada", icon: <AlertCircle className="h-3 w-3 mr-2 text-blue-500" /> },
  { value: "aprobada", label: "Aprobada", icon: <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" /> },
  { value: "rechazada", label: "Rechazada", icon: <XCircle className="h-3 w-3 mr-2 text-red-500" /> },
] as const;

export function QuotesTable({
  quotes,
  loading = false,
  onEdit,
  onDelete,
  onCreate,
  onStatusChange,
}: QuotesTableProps) {
  const [approvingQuote, setApprovingQuote] = useState<Quote | null>(null);

  const getEstadoBadge = (estado: Quote["estado"]) => {
    const styles = {
      borrador: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      enviada: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      aprobada: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      rechazada: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    };
    return styles[estado];
  };

  const handleStatusChange = (quote: Quote, newStatus: Quote["estado"]) => {
    if (newStatus === "aprobada") {
      setApprovingQuote(quote);
    } else if (quote.id) {
      onStatusChange(quote.id, newStatus);
    }
  };

  const handleApproveConfirm = (quoteId: string, otro: string) => {
    onStatusChange(quoteId, "aprobada", otro);
    setApprovingQuote(null);
  };

  const formatDate = (fecha: unknown) => {
    if (!fecha) return "N/A";
    
    if (typeof fecha === "object" && fecha !== null && "toDate" in fecha) {
      return (fecha as { toDate: () => Date }).toDate().toLocaleDateString("es-CO");
    }
    
    if (fecha instanceof Date) return fecha.toLocaleDateString("es-CO");
    
    if (typeof fecha === "string" || typeof fecha === "number") {
      return new Date(fecha).toLocaleDateString("es-CO");
    }
    
    return "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <ExternalLink className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No hay cotizaciones</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Comienza creando tu primera cotización para llevar registro de tus propuestas comerciales
        </p>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Primera Cotización
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {tableHeader.map((header, index) => (
              <TableHead
                key={index}
                className={["Subtotal", "IVA (19%)", "Total", "Acciones"].includes(header) ? "text-right" : ""}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id} className="hover:bg-muted/50">
              <TableCell className="font-mono font-medium">
                {quote.numero}
              </TableCell>
              <TableCell className="font-medium">
                {quote.clienteNombre}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(quote.fecha)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                ${quote.subtotal.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                ${quote.iva.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                ${quote.total.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Select
                  value={quote.estado}
                  onValueChange={(newStatus: Quote["estado"]) => handleStatusChange(quote, newStatus)}
                >
                  <SelectTrigger className={`h-8 w-[120px] text-xs font-medium border-none focus:ring-0 ${getEstadoBadge(quote.estado)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => quote.id && onEdit(quote.id)}
                    disabled={!quote.id}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => quote.id && onDelete(quote.id)}
                    disabled={!quote.id}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ApproveQuoteDialog
        open={!!approvingQuote}
        onOpenChange={(isOpen) => !isOpen && setApprovingQuote(null)}
        quote={approvingQuote}
        onConfirm={handleApproveConfirm}
      />
    </div>
  );
}
