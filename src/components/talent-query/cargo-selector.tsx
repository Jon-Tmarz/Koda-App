import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CargoTipo, CARGOS_LIST } from "@/types/salarios";

interface CargoSelectorProps {
  selectedCargo: CargoTipo;
  onCargoChange: (cargo: CargoTipo) => void;
}

export function CargoSelector({ selectedCargo, onCargoChange }: CargoSelectorProps) {
  return (
    <Card className="border-border/40 max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Seleccionar Cargo
        </CardTitle>
        <CardDescription>
          El desglose se actualiza automáticamente al cambiar el cargo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <label htmlFor="cargo" className="text-sm font-medium">
            Cargo
          </label>
          <select
            id="cargo"
            className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedCargo}
            onChange={(e) => onCargoChange(e.target.value as CargoTipo)}
          >
            {CARGOS_LIST.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
