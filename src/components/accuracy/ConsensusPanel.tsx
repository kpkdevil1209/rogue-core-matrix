import { Layers, Sparkles } from "lucide-react";
import { Panel } from "./Panel";
import { SWARM, type ConsensusVote } from "@/types/accuracy";

export function ConsensusPanel({
  votes,
  golden,
}: {
  votes: ConsensusVote[];
  golden: string | null;
}) {
  return (
    <Panel icon={Layers} title="Fallback Safety Consensus" badge={golden ? "golden sealed" : "merging"}>
      <div className="space-y-2">
        {votes.length === 0 && (
          <p className="rounded border border-dashed border-border px-3 py-4 text-[11px] text-muted-foreground">
            Swarm votes merge here into one golden answer.
          </p>
        )}
        {votes.map((v) => {
          const meta = SWARM.find((m) => m.id === v.model);
          return (
            <div key={v.model} className="rounded border border-border px-3 py-2">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em]">
                <span className="text-accent">{meta?.name ?? v.model}</span>
                <span className="text-muted-foreground">weight {(v.weight * 100).toFixed(0)}%</span>
              </div>
              <p className="mt-1 text-[11px] text-foreground/80">{v.answer}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent" style={{ width: `${v.weight * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {golden && (
        <div className="mt-4 rounded border border-primary/70 bg-primary/10 p-3 ring-glow">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> golden answer
          </p>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground/90">
            {golden}
          </p>
        </div>
      )}
    </Panel>
  );
}
