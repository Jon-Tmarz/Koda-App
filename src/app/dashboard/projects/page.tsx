"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/components/projects/projects-table";
import { projectsService, type Project } from "@/lib/projects-service";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

export default function ActiveProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const activeStatuses: Project['status'][] = ['No iniciado', 'En progreso', 'Pausado'];
      const data = await projectsService.getAll(activeStatuses);
      setProjects(data);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos activos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proyectos Activos"
        description="Seguimiento y estado de los proyectos en curso."
      >
      </PageHeader>
      
      <ProjectsTable
        projects={projects}
        loading={loading}
        onRefresh={loadProjects}
      />
    </div>
  );
}