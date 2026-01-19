"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { ServicesTable } from "@/components/services/services-table";
import { serviciosService, type ServicioFormData } from "@/lib/servicios-service";
import type { Servicio } from "@/types";

export default function ServicesPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Servicio | null>(null);

  // Cargar servicios desde Firestore
  const loadServicios = async () => {
    try {
      setLoading(true);
      const data = await serviciosService.getAll();
      setServicios(data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServicios();
  }, []);

  // Guardar servicio (crear o actualizar)
  const handleSubmit = async (data: ServicioFormData, editingId?: string) => {
    try {
      if (editingId) {
        await serviciosService.update(editingId, data);
      } else {
        await serviciosService.create(data);
      }
      setEditingService(null);
      await loadServicios();
    } catch (error) {
      console.error("Error guardando servicio:", error);
      throw error;
    }
  };

  // Eliminar servicio
  const handleDelete = async (id: string) => {
    try {
      await serviciosService.delete(id);
      await loadServicios();
    } catch (error) {
      console.error("Error eliminando servicio:", error);
    }
  };

  // Abrir diálogo para editar
  const handleEdit = (servicio: Servicio) => {
    setEditingService(servicio);
    setDialogOpen(true);
  };

  // Abrir diálogo para crear
  const handleCreate = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestión de Servicios
          </h2>
          <p className="text-muted-foreground">
            Administra los servicios de tu plataforma
          </p>
        </div>
        <ServiceFormDialog
          editingService={editingService}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingService(null);
          }}
          onSubmit={handleSubmit}
        />
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Lista de Servicios</CardTitle>
          <CardDescription>
            {servicios.length} servicio(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesTable
            servicios={servicios}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
