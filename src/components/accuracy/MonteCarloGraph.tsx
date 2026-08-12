import { GitBranch } from "lucide-react";
import { Panel } from "./Panel";
import { TOTAL_BRANCHES } from "@/lib/accuracyEngine";
import type { Branch, EngineStage } from "@/types/accuracy";

export function MonteCarloGraph({
  branches,
  simulated,
  stage,
}: {
  branches: Branch[];
  simulated: number;
  stage: EngineStage;
}) {
  const verified = branches.filter((b) => b.verified).length;
  const purged = branches.filter((b) => b.purged).length;

  return (
    <Panel
      icon={GitBranch}
      title="1000x Monte-Carlo Reasoning Graph"
      badge={`${simulated.toLocaleString()} / ${TOTAL_BRANCHES.toLocaleString()}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-border bg-background/60">
        {branches.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            branch lattice idle
          </p>
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
            {branches.map((b) => {
              const parent = b.parent === null ? null : branches[b.parent];
              if (!parent) return null;
              return (
                <line
                  key={`e${b.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={b.purged ? "#FF003344" : "#9D00FF55"}
                  strokeWidth={0.25}
                />
              );
            })}
            {branches.map((b) => (
              <circle
                key={b.id}
                cx={b.x}
                cy={b.y}
                r={b.verified ? 0.85 : 0.55}
                fill={b.purged ? "#FF0033" : b.verified ? "#9D00FF" : "#7a2a8a"}
                opacity={stage === "idle" ? 0.4 : 0.95}
              />
            ))}
          </svg>
        )}
        <div className="pointer-events-none absolute inset-0 scan-line opacity-30" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="branches" value={simulated.toLocaleString()} tone="neon" />
        <Stat label="verified nodes" value={String(verified)} tone="neon" />
        <Stat label="purged nodes" value={String(purged)} tone="crimson" />
      </div>
    </Panel>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "neon" | "crimson" }) {
  return (
    <div className="rounded border border-border px-2 py-2">
      <p className={tone === "neon" ? "text-sm font-bold text-accent" : "text-sm font-bold text-primary"}>
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}
