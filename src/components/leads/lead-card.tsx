"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Mail, Phone, Building2, User, Calendar } from "lucide-react";
import type { Lead } from "@/types";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

const estadoColors = {
  nuevo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contactado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  negociacion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cerrado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  perdido: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const estadoLabels = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  negociacion: "Negociación",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{lead.empresa}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {lead.contacto}
            </CardDescription>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              estadoColors[lead.estado as keyof typeof estadoColors] || estadoColors.nuevo
            }`}
          >
            {estadoLabels[lead.estado as keyof typeof estadoLabels] || lead.estado}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Información de contacto */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a
              href={`mailto:${lead.email}`}
              className="hover:text-primary hover:underline"
            >
              {lead.email}
            </a>
          </div>
          {lead.telefono && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a
                href={`tel:${lead.telefono}`}
                className="hover:text-primary hover:underline"
              >
                {lead.telefono}
              </a>
            </div>
          )}
          {lead.createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Calendar className="h-4 w-4" />
              Creado: {formatDate(lead.createdAt)}
            </div>
          )}
        </div>

        {/* Notas */}
        {lead.notas && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {lead.notas}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(lead)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => lead.id && onDelete(lead.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
