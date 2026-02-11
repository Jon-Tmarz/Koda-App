"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useCalculatorLogic } from "../../hooks/use-calculator-logic";
import { CalculatorInputs } from "./CalculatorInputs";
import { EmployeeView } from "./EmployeeView";
import { EmployerView } from "./EmployerView";

export function TalentCalculator() {
  const {
    remoteConfig,
    loading,
    salarioInput,
    setSalarioInput,
    horas,
    setHoras,
    extras,
    setExtras,
    resultados
  } = useCalculatorLogic();

  if (loading && !remoteConfig) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2 mb-8">
        <p className="text-muted-foreground">
          Calcula el costo real de contratación y el salario para talento en Colombia.
        </p>
      </div>

      <CalculatorInputs
        salarioInput={salarioInput}
        setSalarioInput={setSalarioInput}
        horas={horas}
        setHoras={setHoras}
        extras={extras}
        setExtras={setExtras}
        placeholderSalario={remoteConfig ? String(remoteConfig.salarioBase) : undefined}
      />

      <Tabs defaultValue="empleado" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="empleado">Vista Empleado</TabsTrigger>
          <TabsTrigger value="empleador">Vista Empleador</TabsTrigger>
        </TabsList>
        
        <TabsContent value="empleado">
          <EmployeeView resultados={resultados} horas={horas} />
        </TabsContent>

        <TabsContent value="empleador">
          <EmployerView 
            resultados={resultados} 
            horas={horas} 
            costoEmpleadoPercent={remoteConfig?.costoEmpleado}
            gananciaPercent={remoteConfig?.ganancia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
