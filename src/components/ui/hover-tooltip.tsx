"use client";

import { useState, type ReactNode } from "react";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
  enabled?: boolean;
}

export function HoverTooltip({ children, content, enabled = true }: HoverTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 w-64 animate-in fade-in-0 zoom-in-95 pointer-events-none">
          <div className="rounded-md bg-background p-2 text-sm font-normal text-foreground shadow-lg border">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}