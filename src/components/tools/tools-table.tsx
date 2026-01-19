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
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Herramienta } from "@/types";

interface HerramientasTableProps {
  herramientas: Herramienta[];
  loading?: boolean;
  onEdit: (herramienta: Herramienta) => void;
  onDelete: (id: string) => void;
}

const CATEGORIA_LABELS = {
  licencia: "Licencia",
  infraestructura: "Infraestructura",
  herramienta: "Herramienta",
  otro: "Otro",
};

const TIPO_COBRANZA_LABELS = {
  mensual: "Mensual",
  anual: "Anual",
  uso: "Por Uso",
  unico: "Pago Único",
};

export function HerramientasTable({
  herramientas,
  loading = false,
  onEdit,
  onDelete,
}: HerramientasTableProps) {
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta herramienta?")) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (herramientas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No hay herramientas registradas</p>
        <p className="text-sm text-muted-foreground">
          Haz clic en &quot;Nueva Herramienta&quot; para comenzar
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Tipo Cobranza</TableHead>
          <TableHead>Costo</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Disponibilidad</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {herramientas.map((herramienta) => (
          <TableRow key={herramienta.id}>
            <TableCell className="font-medium">{herramienta.nombre}</TableCell>
            <TableCell>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {CATEGORIA_LABELS[herramienta.categoria]}
              </span>
            </TableCell>
            <TableCell>{TIPO_COBRANZA_LABELS[herramienta.tipoCobranza]}</TableCell>
            <TableCell>
              ${herramienta.costo ? herramienta.costo.toFixed(2) : "0.00"}
            </TableCell>
            <TableCell>
              {herramienta.proveedor || (
                <span className="text-muted-foreground italic text-xs">N/A</span>
              )}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  herramienta.disponible
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {herramienta.disponible ? "Activo" : "Inactivo"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(herramienta)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => herramienta.id && handleDelete(herramienta.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
