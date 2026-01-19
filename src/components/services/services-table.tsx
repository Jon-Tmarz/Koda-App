"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Servicio } from "@/types";

interface ServicesTableProps {
  servicios: Servicio[];
  loading?: boolean;
  onEdit: (servicio: Servicio) => void;
  onDelete: (id: string) => void;
}

export function ServicesTable({
  servicios,
  loading = false,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este servicio?")) {
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

  if (servicios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No hay servicios registrados</p>
        <p className="text-sm text-muted-foreground">
          Haz clic en &quot;Nuevo Servicio&quot; para comenzar
        </p>
      </div>
    );
  }

  const tableHeaders = [
    { label: "Nombre", align: "left" as const },
    { label: "Categoría", align: "left" as const },
    { label: "Stack Tecnológico", align: "left" as const },
    { label: "Disponibilidad", align: "left" as const },
    { label: "Acciones", align: "right" as const },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
        {tableHeaders.map((header) => (
            <TableHead key={header.label} className={header.align === "right" ? "text-right" : ""}>
                {header.label}
            </TableHead>
        ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {servicios.map((servicio) => (
          <TableRow key={servicio.id}>
            <TableCell className="font-medium">{servicio.nombre}</TableCell>
            <TableCell>{servicio.categoria}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(servicio.tecnologias) &&
                  servicio.tecnologias.map((tech, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
              </div>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  servicio.disponible
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {servicio.disponible ? "Activo" : "Inactivo"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(servicio)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => servicio.id && handleDelete(servicio.id)}
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
