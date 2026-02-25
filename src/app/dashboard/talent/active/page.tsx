"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ColaboradorFormDialog } from "@/components/talent/colaborador-form-dialog";
import { ColaboradoresTable } from "@/components/talent/colaboradores-table";
import { colaboradoresService, type Colaborador, type ColaboradorFormData } from "@/lib/colaboradores-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserCheck } from "lucide-react";

export default function TalentActivePage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const handleCreate = () => {
    setEditingColaborador(null);
    setDialogOpen(true);
  };

  const actionCards = [
    {
      icon: Users,
      title: "Colaboradores",
      description: "Gestiona tu equipo de trabajo",
      content: "Administra la lista de colaboradores activos, sus cargos, salarios y detalles de contacto.",
      buttonText: "Nuevo Colaborador",
      buttonIcon: Users,
      onClick: handleCreate,
    },
    {
      icon: Pencil,
      title: "Talento",
      description: "Gestiona salario base y parámetros",
      content: "Gestión de costos de talento humano para cotizaciones y listado de colaboradores.",
      buttonText: "Ir a Talento",
      buttonIcon: Pencil,
      href: "/dashboard/talent/cost",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      const data = await colaboradoresService.getAll("Activo");
      setColaboradores(data);
    } catch (error) {
      console.error("Error cargando colaboradores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los colaboradores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColaboradores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data: ColaboradorFormData, editingId?: string) => {
    try {
      if (editingId) {
        await colaboradoresService.update(editingId, data);
        toast({ title: "Éxito", description: "Colaborador actualizado correctamente." });
      } else {
        await colaboradoresService.create(data);
        toast({ title: "Éxito", description: "Colaborador creado correctamente." });
      }
      setEditingColaborador(null);
      await loadColaboradores();
    } catch (error) {
      console.error("Error guardando colaborador:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el colaborador.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await colaboradoresService.delete(id);
      await loadColaboradores();
      toast({ title: "Éxito", description: "Colaborador eliminado correctamente." });
    } catch (error) {
      console.error("Error eliminando colaborador:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el colaborador.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colaboradores Activos"
        description="Gestión de colaboradores activos en la empresa"
      />

      {/* Tarjetas de acción */}
      <div className="flex flex-wrap justify-center gap-6">
        {actionCards.map((card, index) => (
          <Card key={index} className="w-full max-w-sm border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {card.content}
              </p>
              <div className="flex justify-center">
                {card.href ? (
                  <Link href={card.href} className="w-full sm:w-auto sm:min-w-[200px]">
                    <Button className="w-full border-solid border-2 border-primary hover:bg-blue-100 hover:dark:text-blue-900">
                      <card.buttonIcon className="mr-2 h-4 w-4" />
                      {card.buttonText}
                    </Button>
                  </Link>
                ) : card.onClick ? (
                  <Button onClick={card.onClick} className="w-full sm:w-auto sm:min-w-[200px] border-solid border-2 border-primary hover:bg-blue-100 hover:dark:text-blue-900">
                      <card.buttonIcon className="mr-2 h-4 w-4" />
                      {card.buttonText}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Colaboradores Activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Lista de Colaboradores
          </CardTitle>
          <CardDescription>
            {colaboradores.length} colaborador{colaboradores.length !== 1 ? "es" : ""}{" "}
            activo{colaboradores.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ColaboradoresTable
            colaboradores={colaboradores}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        </CardContent>
      </Card>

      {isClient && (
        <ColaboradorFormDialog
          editingColaborador={editingColaborador}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingColaborador(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
