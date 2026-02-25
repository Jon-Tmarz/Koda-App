"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LeadFormDialog, type LeadFormData } from "@/components/leads/lead-form-dialog"; 
import { LeadsStats } from "@/components/leads/leads-stats";
import { LeadsGrid } from "@/components/leads/leads-grid";
import { leadsService } from "@/lib/leads-service"; 
import { PageHeader } from "@/components/ui/page-header";
import type { Lead } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      console.error("Error cargando leads:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (!confirm("¿Estás seguro de eliminar este lead?")) return;
    
    try {
      await leadsService.delete(id);
      toast({
        title: "Éxito",
        description: "Lead eliminado correctamente",
      });
      loadLeads();
    } catch (error) {
      console.error("Error eliminando lead:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el lead",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: LeadFormData, editingId?: string) => {
    try {
      if (editingId) {
        await leadsService.update(editingId, data);
        toast({
          title: "Éxito",
          description: "Lead actualizado correctamente",
        });
      } else {
        await leadsService.create(data);
        toast({
          title: "Éxito",
          description: "Lead creado correctamente",
        });
      }
      setEditingLead(null);
      await loadLeads();
    } catch (error) {
      console.error("Error guardando lead:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el lead",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleNewLead = () => {
    setEditingLead(null);
    setDialogOpen(true);
  };

  const filteredLeads = leadsService.filterByEstado(leads, filterEstado);
  const estadoCounts = leadsService.getEstadoCounts(leads);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Leads"
        description="Administra tus clientes potenciales"
      >
        {isClient && (
          <LeadFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingLead(null);
            }}
            editingLead={editingLead}
            onSubmit={handleSubmit}
          />
        )}
      </PageHeader>

      <LeadsStats stats={estadoCounts} onFilterChange={setFilterEstado} />

      <LeadsGrid
        leads={filteredLeads}
        loading={loading}
        filterEstado={filterEstado}
        onFilterChange={setFilterEstado}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleNewLead}
      />
    </div>
  );
}
