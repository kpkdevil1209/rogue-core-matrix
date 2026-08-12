import { Network, Zap } from "lucide-react";
import { Panel } from "./Panel";
import { SWARM, type ModelId } from "@/types/accuracy";
import { cn } from "@/lib/utils";

export function SwarmRouter({
  active,
  onSelect,
}: {
  active: ModelId;
  onSelect: (id: ModelId) => void;
}) {
  return (
    <Panel icon={Network} title="Multi-Model Swarm Routing" badge="3 lanes">
      <div className="space-y-2">
        {SWARM.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded border px-3 py-2.5 text-left transition-all",
              active === m.id
                ? "border-primary bg-primary/10 ring-glow"
                : "border-border hover:border-accent/70 hover:bg-accent/10",
            )}
          >
            <Zap className={cn("h-4 w-4", active === m.id ? "text-primary" : "text-accent")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{m.name}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {m.role}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-[11px] tabular-nums text-accent">
                {m.latencyMs < 1000 ? `${m.latencyMs}ms` : `${(m.latencyMs / 1000).toFixed(1)}s`}
              </span>
              <span className="text-[9px] text-muted-foreground">{m.accuracy}% acc</span>
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
