"use client";

import { Loader2, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadCard } from "./lead-card";
import type { Lead } from "@/types";

interface LeadsGridProps {
  leads: Lead[];
  loading?: boolean;
  filterEstado: string;
  onFilterChange: (estado: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => Promise<void>;
  onCreate: () => void;
}

export function LeadsGrid({
  leads,
  loading = false,
  filterEstado,
  onFilterChange,
  onEdit,
  onDelete,
  onCreate,
}: LeadsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">
            {filterEstado === "todos"
              ? "No hay leads registrados"
              : `No hay leads en estado "${filterEstado}"`}
          </p>
          {filterEstado === "todos" && (
            <Button className="mt-4" onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer lead
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {filterEstado !== "todos" && (
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Filtrando por:{" "}
            <span className="font-medium capitalize">{filterEstado}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange("todos")}
          >
            Limpiar filtro
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}
