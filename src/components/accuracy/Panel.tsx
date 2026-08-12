import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  icon: Icon,
  title,
  badge,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("hud-panel rounded-lg p-4", className)}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        {badge && (
          <span className="rounded border border-accent/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-accent">
            {badge}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
