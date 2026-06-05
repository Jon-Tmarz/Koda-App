import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Componente reutilizable para encabezados de sección dentro de tarjetas.
 */
export function SectionHeader({ title, description, className }: SectionHeaderProps) {
  return (
    <CardHeader className={cn("text-center pb-2", className)}>
      <CardTitle className="text-foreground text-2xl font-bold text-koda-purple">{title}</CardTitle>
      <CardDescription className="text-koda-blue-dark">{description}</CardDescription>
    </CardHeader>
  );
}