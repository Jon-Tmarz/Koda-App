"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { LeadsStats } from "@/components/leads/leads-stats";
import { LeadsGrid } from "@/components/leads/leads-grid";
import { leadsService } from "@/lib/leads-service";
import type { Lead } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const { toast } = useToast();

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

  const handleSuccess = () => {
    loadLeads();
    setDialogOpen(false);
  };

  const handleNewLead = () => {
    setEditingLead(null);
    setDialogOpen(true);
  };

  const filteredLeads = leadsService.filterByEstado(leads, filterEstado);
  const estadoCounts = leadsService.getEstadoCounts(leads);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestión de Leads
          </h2>
          <p className="text-muted-foreground">
            Administra tus clientes potenciales
          </p>
        </div>
        <Button onClick={handleNewLead}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Lead
        </Button>
      </div>

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

      <LeadFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editingLead}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
