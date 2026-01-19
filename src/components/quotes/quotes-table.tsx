"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Loader2, AlertCircle, CheckCircle2, XCircle, Plus, ExternalLink } from "lucide-react";
import type { Cotizacion } from "@/lib/cotizaciones-service";

interface QuotesTableProps {
  cotizaciones: Cotizacion[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const tableHeader = ["N° Cotización", "Fecha", "Subtotal", "IVA (19%)", "Total", "Estado", "Acciones"];

export function QuotesTable({
  cotizaciones,
  loading = false,
  onEdit,
  onDelete,
  onCreate,
}: QuotesTableProps) {
  const getEstadoBadge = (estado: Cotizacion["estado"]) => {
    const styles = {
      borrador: "bg-gray-500/10 text-gray-500",
      enviada: "bg-blue-500/10 text-blue-500",
      aprobada: "bg-green-500/10 text-green-500",
      rechazada: "bg-red-500/10 text-red-500",
    };
    return styles[estado];
  };

  const getEstadoIcon = (estado: Cotizacion["estado"]) => {
    switch (estado) {
      case "borrador":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case "enviada":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case "aprobada":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "rechazada":
        return <XCircle className="h-3 w-3 mr-1" />;
    }
  };

  const getEstadoLabel = (estado: Cotizacion["estado"]) => {
    const labels = {
      borrador: "Borrador",
      enviada: "Enviada",
      aprobada: "Aprobada",
      rechazada: "Rechazada",
    };
    return labels[estado];
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

  if (cotizaciones.length === 0) {
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
          {cotizaciones.map((cotizacion) => (
            <TableRow key={cotizacion.id} className="hover:bg-muted/50">
              <TableCell className="font-mono font-medium">
                {cotizacion.numero}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(cotizacion.fecha)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                ${cotizacion.subtotal.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                ${cotizacion.iva.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                ${cotizacion.total.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEstadoBadge(
                    cotizacion.estado
                  )}`}
                >
                  {getEstadoIcon(cotizacion.estado)}
                  {getEstadoLabel(cotizacion.estado)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cotizacion.id && onEdit(cotizacion.id)}
                    disabled={!cotizacion.id}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cotizacion.id && onDelete(cotizacion.id)}
                    disabled={!cotizacion.id}
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
    </div>
  );
}
