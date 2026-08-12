import { Check, CircleDashed, Sigma, TriangleAlert } from "lucide-react";
import { Panel } from "./Panel";
import type { LogicStep } from "@/types/accuracy";

export function LogicMatrix({ steps }: { steps: LogicStep[] }) {
  const passed = steps.filter((s) => s.status === "passed").length;

  return (
    <Panel
      icon={Sigma}
      title="Logic Verification Matrix"
      badge={steps.length ? `${passed}/${steps.length} proven` : "idle"}
    >
      <ol className="space-y-2">
        {steps.length === 0 && (
          <li className="rounded border border-dashed border-border px-3 py-4 text-[11px] text-muted-foreground">
            Submit a directive to build the proof chain.
          </li>
        )}
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="flex items-start gap-3 rounded border border-border px-3 py-2"
          >
            <span className="mt-0.5">
              {s.status === "passed" ? (
                <Check className="h-4 w-4 text-accent" />
              ) : s.status === "failed" ? (
                <TriangleAlert className="h-4 w-4 text-primary" />
              ) : (
                <CircleDashed className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold">
                {String(i + 1).padStart(2, "0")} · {s.claim}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.method} — {s.status}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
