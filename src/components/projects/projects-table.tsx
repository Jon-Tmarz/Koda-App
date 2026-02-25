"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Loader2, RefreshCw, Briefcase } from "lucide-react";
import type { Project } from "@/lib/projects-service";
import { Timestamp } from "firebase/firestore";

interface ProjectsTableProps {
  projects: Project[];
  loading?: boolean;
  onRefresh: () => void;
}

const formatDate = (date: unknown) => {
  if (!date) return "N/A";
  const d = (date as Timestamp).toDate();
  return d.toLocaleDateString("es-CO", { year: 'numeric', month: 'long', day: 'numeric' });
};

export function ProjectsTable({ projects, loading, onRefresh }: ProjectsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold">No hay proyectos activos</h3>
        <p className="mt-1 text-sm">Cuando una cotización es aprobada, el proyecto aparecerá aquí.</p>
        <Button variant="outline" onClick={onRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refrescar
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha de Inicio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[200px]">Progreso</TableHead>
            <TableHead className="text-right">Enlace</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <div>{project.projectName}</div>
                <div className="text-xs text-muted-foreground">{project.quoteNumber}</div>
              </TableCell>
              <TableCell>{project.clienteNombre}</TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-full" />
                  <span className="text-xs font-mono text-muted-foreground">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {project.externalLink ? (
                  <Button asChild variant="ghost" size="icon">
                    <a href={project.externalLink} target="_blank" rel="noopener noreferrer" title="Ver en gestor de proyectos">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}