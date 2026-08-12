import { Gauge } from "lucide-react";
import { Panel } from "./Panel";
import type { EngineStage } from "@/types/accuracy";

const STAGE_TEXT: Record<EngineStage, string> = {
  idle: "Engine idle — awaiting directive",
  ambiguity: "Intent vague — resolving ambiguity…",
  simulating: "Simulating 1,000 Solutions…",
  guardrail: "Zero-Hallucination guardrail sweep…",
  verifying: "Fact Checking…",
  consensus: "Merging swarm consensus…",
  done: "Golden answer sealed",
};

export function AccuracyHud({
  stage,
  confidence,
  drift,
}: {
  stage: EngineStage;
  confidence: number;
  drift: number;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (confidence / 100) * c;
  const active = stage !== "idle" && stage !== "done";

  return (
    <Panel icon={Gauge} title="Live Accuracy HUD" badge={stage}>
      <div className="flex flex-col items-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#2a1030" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={confidence > 85 ? "#9D00FF" : "#FF0033"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-glow-neon">{confidence}%</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              confidence
            </span>
          </div>
        </div>
        <p
          className={
            active
              ? "mt-3 animate-pulse text-center text-[11px] uppercase tracking-[0.2em] text-primary"
              : "mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          }
        >
          {STAGE_TEXT[stage]}
        </p>
        <div className="mt-4 w-full space-y-2">
          <Bar label="hallucination risk" value={Math.max(1, 100 - confidence)} tone="crimson" />
          <Bar label="semantic drift" value={drift} tone="neon" />
        </div>
      </div>
    </Panel>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "neon" | "crimson" }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={tone === "neon" ? "h-full bg-accent transition-all" : "h-full bg-primary transition-all"}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
