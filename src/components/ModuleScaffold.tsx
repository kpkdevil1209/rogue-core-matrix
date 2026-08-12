import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";

interface Props {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  capabilities: string[];
}

export function ModuleScaffold({ icon: Icon, tag, title, description, capabilities }: Props) {
  return (
    <div className="space-y-6">
      <div className="hud-panel rounded-lg p-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-glow-neon">
          {tag}
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-glow-crimson">
          <Icon className="h-6 w-6 text-primary" />
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((c) => (
          <div key={c} className="hud-panel rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide">{c}</span>
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Awaiting Part 2 payload
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/3 bg-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}