"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Search, Calculator, Users } from "lucide-react";

export default function TalentCostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Coste del Talento</h2>
        <p className="text-muted-foreground">
          Gestión de costos de talento humano para cotizaciones
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Botón Edición Salario */}
        <Card className="border-border/40 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Pencil className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Edición Salario</CardTitle>
                <CardDescription>
                  Configura el salario base y parámetros
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Modifica el salario mínimo, auxilio de transporte, porcentajes de
              IVA, ganancia y costos adicionales para calcular cotizaciones.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard/talent/edit" className="w-1/2">
                <Button className="w-full border-solid border-2 border-primary hover:bg-blue-100 hover:dark:text-blue-900">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Configuración
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Botón Consultar Salario */}
        <Card className="border-border/40 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Consultar Salario</CardTitle>
                <CardDescription>
                  Consulta salarios por cargo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualiza el desglose completo de salarios mensuales y por hora
              según el nivel de experiencia del cargo.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard/talent/query" className="w-1/2">
                <Button className="w-full border-solid border-2 border-primary hover:bg-blue-100 hover:dark:text-blue-900">
                  <Search className="mr-2 h-4 w-4" />
                  Consultar Salarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Fórmula de Cálculo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Multiplicadores por Cargo
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Auxiliar:</strong> 1x Salario Base</li>
                <li>• <strong>Técnico:</strong> 2x Salario Base</li>
                <li>• <strong>Tecnólogo:</strong> 3x Salario Base</li>
                <li>• <strong>Profesional:</strong> 4x Salario Base</li>
                <li>• <strong>Profesional Especialista:</strong> 5x Salario Base</li>
                <li>• <strong>Profesional Master:</strong> 7x Salario Base</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Componentes del Cálculo
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Salario Base × Multiplicador</li>
                <li>• + Auxilio de Transporte (si aplica)</li>
                <li>• × Factor Costo Empleado</li>
                <li>• + Ganancia Empresa (%)</li>
                <li>• + IVA (%)</li>
                <li>• = Total Mensual / Horas = Valor Hora</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
