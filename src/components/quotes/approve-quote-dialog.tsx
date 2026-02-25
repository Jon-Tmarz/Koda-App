"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Quote } from "@/lib/quotes-service";

interface ApproveQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onConfirm: (quoteId: string, otro: string) => void;
}

export function ApproveQuoteDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
}: ApproveQuoteDialogProps) {
  const [otro, setOtro] = useState("");

  useEffect(() => {
    if (!open) {
      setOtro("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (quote?.id) {
      onConfirm(quote.id, otro);
    }
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Cotización</DialogTitle>
          <DialogDescription>
            Estás a punto de marcar la cotización para{" "}
            <span className="font-bold text-primary">{quote.clienteNombre}</span> como "Aprobada".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="otro">Otro</Label>
          <Input id="otro" value={otro} onChange={(e) => setOtro(e.target.value)} placeholder="Información adicional (opcional)..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Aceptar y Aprobar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}