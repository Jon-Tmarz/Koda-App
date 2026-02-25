import { NextResponse } from "next/server";
import { projectsService } from "@/lib/projects-service";
import { z } from "zod";

// Aquí iría la lógica para validar la API Key, similar a otros endpoints.
// Por simplicidad, este ejemplo se enfoca en la lógica del PUT.

const updateSchema = z.object({
    status: z.enum(['No iniciado', 'En progreso', 'Pausado', 'Finalizado', 'Cancelado']).optional(),
    progress: z.number().min(0).max(100).optional(),
    externalLink: z.string().url().optional(),
  }).strict();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "El ID del proyecto es requerido" }, { status: 400 });
    }

    const project = await projectsService.getById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: "Proyecto no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Cuerpo de la petición inválido", details: validation.error.format() }, { status: 400 });
    }

    await projectsService.update(projectId, validation.data);

    const updatedProject = await projectsService.getById(projectId);

    return NextResponse.json({ success: true, message: "Proyecto actualizado exitosamente", data: updatedProject });

  } catch (error) {
    console.error("[PROJECTS_PUT_API]", error);
    return NextResponse.json({ success: false, error: "Error Interno del Servidor" }, { status: 500 });
  }
}