"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Colaborador } from "@/types";

interface ColaboradoresTableProps {
  colaboradores: Colaborador[];
  loading?: boolean;
  onEdit: (colaborador: Colaborador) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  if (!date || !(date instanceof Date)) return 'N/A';
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export function ColaboradoresTable({
  colaboradores,
  loading = false,
  onEdit,
  onDelete,
  onCreate,
}: ColaboradoresTableProps) {
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este colaborador?")) {
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

  const tableHeaders = [
    { label: "Nombre", align: "left" as const},
    { label: "Cargo", align: "left" as const},
    { label: "Email", align: "left" as const},
    { label: "Teléfono", align: "left" as const},
    { label: "Fecha Ingreso", align: "left" as const},
    { label: "Salario", align: "left" as const},
    { label: "Estado", align: "left" as const},
    { label: "Acciones", align: "right" as const},
  ];

  if (colaboradores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay colaboradores activos registrados.</p>
        <Button variant="link" onClick={onCreate}>Crear el primero</Button>
      </div>
    );
  }

  return (
    <div className="relative max-h-[70vh] overflow-y-auto border rounded-lg">
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
          {colaboradores.map((colaborador) => (
            <TableRow key={colaborador.id}>
              <TableCell className="font-medium">{colaborador.nombre}</TableCell>
              <TableCell>{colaborador.cargo}</TableCell>
              <TableCell>{colaborador.email}</TableCell>
              <TableCell>{colaborador.telefono || "-"}</TableCell>
              <TableCell>{formatDate(colaborador.fechaIngreso)}</TableCell>
              <TableCell>{formatCurrency(colaborador.salario)}</TableCell>
              <TableCell>
                <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  colaborador.estado
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {colaborador.estado}
              </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(colaborador)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => colaborador.id && handleDelete(colaborador.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}