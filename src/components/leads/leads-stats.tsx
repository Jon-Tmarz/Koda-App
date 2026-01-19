"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EstadoStats {
  todos: number;
  nuevo: number;
  contactado: number;
  negociacion: number;
  cerrado: number;
  perdido: number;
}

interface LeadsStatsProps {
  stats: EstadoStats;
  onFilterChange: (estado: string) => void;
}

export function LeadsStats({ stats, onFilterChange }: LeadsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("todos")}>
        <CardHeader className="pb-2">
          <CardDescription>Todos</CardDescription>
          <CardTitle className="text-3xl">{stats.todos}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("nuevo")}>
        <CardHeader className="pb-2">
          <CardDescription>Nuevos</CardDescription>
          <CardTitle className="text-3xl">{stats.nuevo}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("contactado")}>
        <CardHeader className="pb-2">
          <CardDescription>Contactados</CardDescription>
          <CardTitle className="text-3xl">{stats.contactado}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("negociacion")}>
        <CardHeader className="pb-2">
          <CardDescription>Negociación</CardDescription>
          <CardTitle className="text-3xl">{stats.negociacion}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("cerrado")}>
        <CardHeader className="pb-2">
          <CardDescription>Cerrados</CardDescription>
          <CardTitle className="text-3xl">{stats.cerrado}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="cursor-pointer hover:bg-accent" onClick={() => onFilterChange("perdido")}>
        <CardHeader className="pb-2">
          <CardDescription>Perdidos</CardDescription>
          <CardTitle className="text-3xl">{stats.perdido}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
