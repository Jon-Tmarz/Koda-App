"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Settings, Menu, X, FileText, Contact, Briefcase, UserCog, LogOut, Wrench, CalendarArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  // { name: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Leads", href: "/dashboard/leads", icon: Contact },
  { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText },
  { name: "Projectos", href: "/dashboard/projects/", icon: CalendarArrowUp },
  { name: "Servicios", href: "/dashboard/services", icon: Briefcase },
  { name: "Herramientas", href: "/dashboard/tools", icon: Wrench },
  { name: "Talento", href: "/dashboard/talent/cost", icon: UserCog },
  { name: "Setup", href: "/dashboard/setup", icon: Settings },
];

// Crear un contexto para compartir el estado collapsed
export const SidebarContext = React.createContext<{
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}>({
  collapsed: true,
  setCollapsed: () => {
    // Default implementation
  },
});

// Hook personalizado para usar el sidebar
export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const pathname = usePathname();

  const handleLogout = () => {
    // Aquí puedes agregar la lógica de logout (Firebase, etc.)
    window.location.href = "/login";
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">K</span>
              </div>
              <span className="text-xl font-bold">KODA</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg"
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => collapsed && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
                {/* Tooltip flotante cuando está colapsado */}
                {collapsed && hoveredItem === item.name && (
                  <div className="fixed left-20 z-50 animate-in fade-in-0 zoom-in-95 pointer-events-none">
                    <div className="rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-700">
                      {item.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("Cerrar Sesión")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </Button>
            {/* Tooltip flotante cuando está colapsado */}
            {collapsed && hoveredItem === "Cerrar Sesión" && (
              <div className="fixed left-20 z-50 animate-in fade-in-0 zoom-in-95 pointer-events-none">
                <div className="rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-700">
                  Cerrar Sesión
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Top Bar (for mobile and theme toggle) */}
      <header
        className={cn(
          "fixed right-0 top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
          collapsed ? "left-16" : "left-64"
        )}
      >
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Portal Administrativo</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
