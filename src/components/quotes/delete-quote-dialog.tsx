"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteQuoteDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: DeleteQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle><span className="text-black">Eliminar Cotización</span></DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
