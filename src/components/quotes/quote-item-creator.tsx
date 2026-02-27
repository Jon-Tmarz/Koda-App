"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Servicio, CargoTipo, SalarioConfig } from "@/types";
import { calcularSalarioCompleto } from "@/lib/salarios";

const BLANK_ITEM = {
  descripcion: "",
  cargo: undefined,
  horas: 1,
  costoPorHora: 0,
};

interface QuoteItemCreatorProps {
  servicios: Servicio[];
  salarioConfig: SalarioConfig | null;
  multipliers: Record<string, number> | undefined;
  onAddItem: (item: { descripcion: string; cargo?: string; horas: number; costoPorHora: number; subtotal: number }) => void;
}

export function QuoteItemCreator({ servicios, salarioConfig, multipliers, onAddItem }: QuoteItemCreatorProps) {
  const [item, setItem] = useState(BLANK_ITEM);

  const calculateCost = (cargo: CargoTipo | undefined): number => {
    if (!salarioConfig || !multipliers || !cargo) {
      return 0;
    }
    try {
      const resultado = calcularSalarioCompleto(salarioConfig, cargo, multipliers);
      return Math.round(resultado.porHora.totalPorHora);
    } catch (e) {
      console.error(`No se pudo calcular el costo para el cargo: ${cargo}`, e);
      return 0;
    }
  };

  const handleServiceChange = (value: string) => {
    const servicioSeleccionado = servicios.find(s => s.nombre === value);
    let cargoParaCalcular: CargoTipo | undefined;
    let costo = 0;

    if (servicioSeleccionado?.cargosSugeridos?.length) {
      cargoParaCalcular = servicioSeleccionado.cargosSugeridos[0] as CargoTipo;
      costo = calculateCost(cargoParaCalcular);
    }

    setItem(prev => ({
      ...prev,
      descripcion: value,
      cargo: cargoParaCalcular,
      costoPorHora: costo,
    }));
  };

  const handleCargoChange = (value: CargoTipo) => {
    const costo = calculateCost(value);
    setItem(prev => ({ ...prev, cargo: value, costoPorHora: costo }));
  };

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItem(prev => ({ ...prev, horas: parseFloat(e.target.value) || 0 }));
  };

  const handleAddItem = () => {
    if (item.descripcion && item.horas > 0) {
      onAddItem({ ...item, subtotal: item.horas * item.costoPorHora });
      setItem(BLANK_ITEM); // Reset form
    }
  };

  const cargosSugeridos = useMemo(() => {
    const servicioSeleccionado = servicios.find(s => s.nombre === item.descripcion);
    return servicioSeleccionado?.cargosSugeridos || [];
  }, [item.descripcion, servicios]);

  const subtotal = useMemo(() => item.horas * item.costoPorHora, [item.horas, item.costoPorHora]);

  return (
    <Card className="p-4 bg-foreground border-border">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-item-descripcion">Descripción *</Label>
            <Select onValueChange={handleServiceChange} value={item.descripcion}>
              <SelectTrigger id="new-item-descripcion">
                <SelectValue placeholder="Selecciona un servicio..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {servicios.map((servicio) => (
                  <SelectItem key={servicio.id} value={servicio.nombre}>
                    {servicio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-item-cargo">Cargo</Label>
            <Select onValueChange={handleCargoChange} value={item.cargo} disabled={cargosSugeridos.length === 0}>
              <SelectTrigger id="new-item-cargo">
                <SelectValue placeholder="Selecciona un cargo..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {cargosSugeridos.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="new-item-horas">Horas *</Label>
            <Input
              id="new-item-horas"
              type="number"
              min="0"
              step="0.5"
              value={item.horas}
              onChange={handleHorasChange}
              placeholder="0"
              className="tabular-nums"
            />
          </div>
          <div className="grid gap-2">
            <Label>Costo/Hora</Label>
            <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted font-semibold tabular-nums text-black">
              ${item.costoPorHora.toLocaleString("es-CO")}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Subtotal</Label>
            <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted font-semibold tabular-nums text-black">
              ${subtotal.toLocaleString("es-CO")}
            </div>
          </div>
          <Button type="button" onClick={handleAddItem} disabled={!item.descripcion || item.horas <= 0}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </Card>
  );
}