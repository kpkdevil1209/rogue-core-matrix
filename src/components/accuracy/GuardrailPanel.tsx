import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Panel } from "./Panel";
import type { EngineStage, PurgedStatement } from "@/types/accuracy";

const NODES = [
  "web.relay/eu-3",
  "corpus.mirror/07",
  "vault.local/idx",
  "spec.local/registry",
  "stats.node/base",
  "peer.consensus/11",
];

export function GuardrailPanel({
  stage,
  purged,
}: {
  stage: EngineStage;
  purged: PurgedStatement[];
}) {
  const armed = stage !== "idle" && stage !== "ambiguity";

  return (
    <Panel icon={ShieldCheck} title="Zero-Hallucination Guardrail" badge={armed ? "cross-checking" : "standby"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {NODES.map((n, i) => (
          <div
            key={n}
            className="flex items-center gap-2 rounded border border-border px-2 py-1.5 text-[10px]"
          >
            {armed && i !== 4 ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
            <span className="truncate text-muted-foreground">{n}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-4 text-[10px] uppercase tracking-[0.22em] text-primary">
        Self-Consistency Filter — purged claims
      </h3>
      <ul className="mt-2 space-y-2">
        {purged.length === 0 && (
          <li className="rounded border border-dashed border-border px-3 py-3 text-[11px] text-muted-foreground">
            No contradictions detected yet.
          </li>
        )}
        {purged.map((p) => (
          <li key={p.id} className="rounded border border-primary/40 bg-primary/5 px-3 py-2">
            <p className="text-[11px] text-foreground/80 line-through decoration-primary/70">{p.text}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-primary">{p.reason}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
