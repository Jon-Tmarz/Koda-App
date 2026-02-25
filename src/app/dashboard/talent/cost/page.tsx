"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Search, Calculator, Users } from "lucide-react";
import { useSalarios } from "@/hooks/use-salarios";
import { PageHeader } from "@/components/ui/page-header";

export default function TalentCostPage() {
  const { config, multipliers, loading } = useSalarios();
  const itemsCalc = [
    "Salario Base × Multiplicador",
    "+ Auxilio de Transporte (si aplica)",
    "× Factor Costo Empleado",
    "+ Ganancia Empresa (%)",
    "+ IVA (%)",
    "= Total Mensual / Horas = Valor Hora"
  ]

  const actionCards = [
    {
      icon: Pencil,
      title: "Edición Salario",
      description: "Configura el salario base y parámetros",
      content: "Modifica el salario mínimo, auxilio de transporte, porcentajes de IVA, ganancia y costos adicionales para calcular cotizaciones.",
      buttonText: "Editar Configuración",
      buttonIcon: Pencil,
      href: "/dashboard/talent/edit",
    },
    {
      icon: Search,
      title: "Consultar Salario",
      description: "Consulta salarios por cargo",
      content: "Visualiza el desglose completo de salarios mensuales y por hora según el nivel de experiencia del cargo.",
      buttonText: "Consultar Salarios",
      buttonIcon: Search,
      href: "/dashboard/talent/query",
    },
    {
      icon: Users,
      title: "Colaboradores",
      description: "Gestiona tu equipo de trabajo",
      content: "Administra la lista de colaboradores activos, sus cargos, salarios y detalles de contacto.",
      buttonText: "Ver Talentos",
      buttonIcon: Users,
      href: "/dashboard/talent/active",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talento"
        description="Gestión de costos de talento humano para cotizaciones y listado de colaboradores."
      />

      {/* Tarjetas de acción */}
      <div className="grid gap-6 md:grid-cols-3">
        {actionCards.map((card, index) => (
          <Card key={index} className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {card.content}
              </p>
              <div className="flex justify-center">
                <Link href={card.href} className="w-full sm:w-auto sm:min-w-[200px]">
                  <Button className="w-full border-solid border-2 border-primary hover:bg-blue-100 hover:dark:text-blue-900">
                    <card.buttonIcon className="mr-2 h-4 w-4" />
                    {card.buttonText}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
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
                {Object.entries(multipliers).map(([level, multiplier]) => (
                  <li key={level}>• <strong>{level}:</strong> {multiplier}x Salario Base</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Componentes del Cálculo
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {itemsCalc.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
