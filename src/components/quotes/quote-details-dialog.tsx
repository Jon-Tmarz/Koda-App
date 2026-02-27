"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface QuoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  initialContent?: string;
  onSave: (details: { titulo: string; contenido: string }) => void;
}

export function QuoteDetailsDialog({
  open,
  onOpenChange,
  initialTitle = "",
  initialContent = "",
  onSave,
}: QuoteDetailsDialogProps) {
  const [titulo, setTitulo] = useState(initialTitle);
  const [contenido, setContenido] = useState(initialContent);

  useEffect(() => {
    if (open) {
      setTitulo(initialTitle);
      setContenido(initialContent);
    }
  }, [open, initialTitle, initialContent]);

  const handleSave = () => {
    onSave({ titulo, contenido });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">Detalles del Proyecto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo-proyecto" className="text-foreground">
              Título del Proyecto
            </Label>
            <Input
              id="titulo-proyecto"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Desarrollo de Plataforma E-commerce"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contenido-proyecto" className="text-foreground">
              Contenido (Alcance, Objetivos, etc.)
            </Label>
            <TiptapEditor content={contenido} onChange={setContenido} />
          </div>
        </div>
        {/* Aumentamos el padding top para dar espacio al editor que ahora es más alto */}
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSave}>Guardar Detalles</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}