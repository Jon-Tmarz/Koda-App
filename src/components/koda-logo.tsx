import Image from "next/image";
import { cn } from "@/lib/utils";

interface KodaLogoProps {
  className?: string;
}

/**
 * Componente para mostrar el logo de Koda.
 * Utiliza Next/Image para optimización y carga prioritaria.
 * El logo se encuentra en `/public/koda-logo.webp`.
 */
export function KodaLogo({ className }: KodaLogoProps) {
  return (
    <Image
      src="/koda-logo.webp"
      alt="Logo de Koda"
      width={120}
      height={32}
      className={cn("h-8 w-auto", className)}
      priority
    />
  );
}