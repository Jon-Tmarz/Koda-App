"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { type Herramienta, CATEGORIA_LABELS, TIPO_COBRANZA_LABELS } from "@/types";

interface HerramientasTableProps {
  herramientas: Herramienta[];
  loading?: boolean;
  onEdit: (herramienta: Herramienta) => void;
  onDelete: (id: string) => void;
}

const headerTable: Array<{ key: string; label: string; sortable: boolean; align?: "right" | "left" | "center" | "justify" | "char" }> = [
  { key: "nombre", label: "Nombre", sortable: true },
  { key: "categoria", label: "Categoría", sortable: true },
  { key: "tipoCobranza", label: "Tipo Cobranza", sortable: false },
  { key: "costo", label: "Costo", sortable: false },
  { key: "proveedor", label: "Proveedor", sortable: true },
  { key: "disponible", label: "Disponibilidad", sortable: false },
  { key: "acciones", label: "Acciones", sortable: false, align: "right" },
]

type SortableKeys = "nombre" | "categoria" | "proveedor";

export function HerramientasTable({
  herramientas,
  loading = false,
  onEdit,
  onDelete,
}: HerramientasTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys | null;
    direction: "ascending" | "descending";
  }>({ key: "nombre", direction: "ascending" });

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta herramienta?")) {
      onDelete(id);
    }
  };

  const sortedHerramientas = useMemo(() => {
    const sortableItems = [...herramientas];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!] || "";
        const valB = b[sortConfig.key!] || "";

        if (sortConfig.direction === "ascending") {
          return (valA as string).localeCompare(valB as string);
        } else {
          return (valB as string).localeCompare(valA as string);
        }
      });
    }
    return sortableItems;
  }, [herramientas, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableKeys) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 inline-block h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 inline-block h-4 w-4" />
    );
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
    <div className="relative max-h-[70vh] overflow-y-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {headerTable.map((header) => (
            <TableHead
              key={header.key}
              className={`${header.sortable ? "cursor-pointer" : ""} sticky top-0 z-10 bg-background/95 backdrop-blur-sm ${header.align === 'right' ? 'text-right' : ''}`}
              onClick={() => header.sortable && requestSort(header.key as SortableKeys)}
            >
            {header.label} {header.sortable && getSortIcon(header.key as SortableKeys)}
            </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHerramientas.map((herramienta) => (
            <TableRow key={herramienta.id}>
              <TableCell className="font-medium">
                <HoverTooltip
                  enabled={!!herramienta.descripcion}
                  content={
                  <div className="bg-white">
                    <p className="font-semibold mb-1">Descripción:</p>
                    {herramienta.descripcion}
                  </div>
                  }
                >
                  {herramienta.nombre}
                </HoverTooltip>
              </TableCell>
              <TableCell>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {CATEGORIA_LABELS[herramienta.categoria]}
                </span>
              </TableCell>
              <TableCell>{TIPO_COBRANZA_LABELS[herramienta.tipoCobranza]}</TableCell>
              <TableCell>
                {herramienta.tipoCobranza === "uso" && "Desde "}
                {`$${(herramienta.costo || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} `}
                <span className="text-xs text-muted-foreground">
                  {herramienta.divisa || "USD"}
                </span>
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
    </div>
  );
}
