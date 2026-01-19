"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HerramientaFormDialog } from "@/components/tools/tool-form-dialog";
import { HerramientasTable } from "@/components/tools/tools-table";
import { herramientasService, type HerramientaFormData } from "@/lib/tools-service";
import type { Herramienta } from "@/types";

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHerramienta, setEditingHerramienta] = useState<Herramienta | null>(null);

  const loadHerramientas = async () => {
    try {
      setLoading(true);
      const data = await herramientasService.getAll();
      setHerramientas(data);
    } catch (error) {
      console.error("Error cargando herramientas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHerramientas();
  }, []);

  const handleSubmit = async (data: HerramientaFormData, editingId?: string) => {
    try {
      if (editingId) {
        await herramientasService.update(editingId, data);
      } else {
        await herramientasService.create(data);
      }
      setEditingHerramienta(null);
      await loadHerramientas();
    } catch (error) {
      console.error("Error guardando herramienta:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await herramientasService.delete(id);
      await loadHerramientas();
    } catch (error) {
      console.error("Error eliminando herramienta:", error);
    }
  };

  const handleEdit = (herramienta: Herramienta) => {
    setEditingHerramienta(herramienta);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Herramientas Tecnológicas
          </h2>
          <p className="text-muted-foreground">
            Administra el catálogo de herramientas que dominas y puedes ofrecer
          </p>
        </div>
        <HerramientaFormDialog
          editingHerramienta={editingHerramienta}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingHerramienta(null);
          }}
          onSubmit={handleSubmit}
        />
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Catálogo de Herramientas</CardTitle>
          <CardDescription>
            {herramientas.length} herramienta(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HerramientasTable
            herramientas={herramientas}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
