"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: "23,456",
    icon: Users,
    change: "+12.5%",
    changeType: "positive",
  },
  {
    title: "Total Tareas",
    value: "12",
    icon: FileText,
    change: "+4.3%",
    changeType: "positive",
  },
  {
    title: "Proyectos Activos",
    value: "8",
    icon: Briefcase,
    change: "+2.1%",
    changeType: "positive",
  },
  {
    title: "Ingresos Estimados",
    value: "Max 231980",
    icon: TrendingUp,
    change: "+18.2%",
    changeType: "positive",
  },
];

const activityData = [
  { name: "Ene", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Abr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Bienvenido al portal administrativo Koda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> desde el
                mes pasado
              </p>
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
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
