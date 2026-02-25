"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { Briefcase, Users, FileText, TrendingUp, Loader2, Database, TestTube2 } from "lucide-react";
import { quotesService, type Quote } from "@/lib/quotes-service";
import { leadsService } from "@/lib/leads-service";
import { Timestamp } from "firebase/firestore";

// Static test data
const staticStats = [
  { title: "Total Leads", value: "152", icon: Users, change: "+12.5%", changeType: "positive" },
  { title: "Cotizaciones", value: "48", icon: FileText, change: "+4.3%", changeType: "positive" },
  { title: "Proyectos Activos", value: "8", icon: Briefcase, change: "+2.1%", changeType: "positive" },
  { title: "Ingresos (Aprobados)", value: "$231,980", icon: TrendingUp, change: "+18.2%", changeType: "positive" },
];

const staticActivityData = [
  { name: "Ene", value: 40000 },
  { name: "Feb", value: 30000 },
  { name: "Mar", value: 60000 },
  { name: "Abr", value: 80000 },
  { name: "May", value: 50000 },
  { name: "Jun", value: 70000 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [useTestData, setUseTestData] = useState(true);
  const [hasFirestoreData, setHasFirestoreData] = useState(false);
  const [dynamicData, setDynamicData] = useState<{ stats: any[]; activity: any[] }>({ stats: [], activity: [] });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Asumiendo que leadsService.getAll() existe y funciona como quotesService.getAll()
        const [leads, quotes] = await Promise.all([
          leadsService.getAll(),
          quotesService.getAll(),
        ]);

        if (leads.length > 0 || quotes.length > 0) {
          setHasFirestoreData(true);

          // Calcular estadísticas dinámicas
          const totalLeads = leads.length;
          const totalQuotes = quotes.length;
          const ingresosAprobados = quotes
            .filter(q => q.estado === 'aprobada')
            .reduce((sum, q) => sum + q.total, 0);

          const dynamicStatsData = [
            { title: "Total Leads", value: totalLeads.toLocaleString('es-CO'), icon: Users, change: null },
            { title: "Cotizaciones", value: totalQuotes.toLocaleString('es-CO'), icon: FileText, change: null },
            { title: "Proyectos Activos", value: "N/A", icon: Briefcase, change: null },
            { title: "Ingresos (Aprobados)", value: `$${ingresosAprobados.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, icon: TrendingUp, change: null },
          ];

          // Calcular actividad dinámica de los últimos 6 meses
          const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          const monthlyActivity = new Map<string, number>();
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
            monthlyActivity.set(monthKey, 0);
          }

          quotes.forEach(quote => {
            // The service layer now ensures `fecha` is a valid Date object.
            const date = quote.fecha as Date;
            const monthKey = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
            if (monthlyActivity.has(monthKey)) {
              monthlyActivity.set(monthKey, monthlyActivity.get(monthKey)! + quote.total);
            }
          });

          const dynamicActivityData = Array.from(monthlyActivity.entries()).map(([name, value]) => ({ name, value }));

          setDynamicData({ stats: dynamicStatsData, activity: dynamicActivityData });
        } else {
          setHasFirestoreData(false);
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        setHasFirestoreData(false);
      } finally {
        setUseTestData(true);
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const currentStats = useTestData ? staticStats : dynamicData.stats;
  const currentActivityData = useTestData ? staticActivityData : dynamicData.activity;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bienvenido al portal administrativo Koda
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseTestData(!useTestData)}
            disabled={!hasFirestoreData}
            className="w-[180px]"
          >
            {useTestData ? (
              <><Database className="mr-2 h-4 w-4" /> Ver Datos Reales</>
            ) : (
              <><TestTube2 className="mr-2 h-4 w-4" /> Ver Datos de Prueba</>
            )}
          </Button>
        </div>
      </div>

      {useTestData && (
        <div className="text-center p-2 bg-yellow-100 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-300 rounded-md border border-yellow-300 dark:border-yellow-800">
          <p className="font-semibold">Datos de Prueba</p>
          {!hasFirestoreData && <p className="text-xs">No se encontraron datos. Mostrando datos de ejemplo.</p>}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentStats.map((stat) => (
          <Card key={stat.title} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{stat.change}</span> desde el mes pasado
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Evolución de Ingresos de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentActivityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(Number(value) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [`$${value.toLocaleString('es-CO')}`, "Ingresos"]}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
