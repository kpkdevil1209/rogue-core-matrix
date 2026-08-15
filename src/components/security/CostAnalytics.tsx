import { useMemo, useState } from "react";
import { Activity, Gauge } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import type { CostSample } from "@/types/security";

const MODELS = [
  { id: "groq/llama-3.3-70b", inUsd: 0.00000059, outUsd: 0.00000079, baseMs: 210 },
  { id: "deepseek-r1", inUsd: 0.00000055, outUsd: 0.00000219, baseMs: 940 },
  { id: "claude-3.5-sonnet", inUsd: 0.000003, outUsd: 0.000015, baseMs: 1180 },
] as const;

const PKR_PER_USD = 278.5;

export function CostAnalytics() {
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [prompt, setPrompt] = useState("Audit this contract for reentrancy and flash-loan risk.");
  const [samples, setSamples] = useState<CostSample[]>([]);

  const promptTokens = useMemo(
    () => Math.max(1, Math.ceil(prompt.trim().length / 4)),
    [prompt],
  );

  const run = () => {
    const m = MODELS.find((x) => x.id === model)!;
    const completionTokens = Math.round(promptTokens * (2 + Math.random() * 3));
    const latencyMs = Math.round(m.baseMs + completionTokens * 1.8 + Math.random() * 180);
    const usd = promptTokens * m.inUsd + completionTokens * m.outUsd;
    setSamples((s) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          model: m.id,
          promptTokens,
          completionTokens,
          latencyMs,
          usd,
          pkr: usd * PKR_PER_USD,
          at: Date.now(),
        },
        ...s,
      ].slice(0, 20),
    );
  };

  const totals = samples.reduce(
    (acc, s) => ({
      tokens: acc.tokens + s.promptTokens + s.completionTokens,
      usd: acc.usd + s.usd,
      pkr: acc.pkr + s.pkr,
      ms: acc.ms + s.latencyMs,
    }),
    { tokens: 0, usd: 0, pkr: 0, ms: 0 },
  );
  const avgMs = samples.length ? Math.round(totals.ms / samples.length) : 0;

  return (
    <Panel icon={Gauge} title="Real-Time Token &amp; Cost Analytics" tag="usd / pkr">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
        />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded border border-border bg-background/70 px-2 py-2 text-xs outline-none focus:border-accent"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
        <ActionButton variant="accent" onClick={run}>
          <Activity className="h-3.5 w-3.5" /> Meter Call
        </ActionButton>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "prompt tokens", value: promptTokens.toLocaleString() },
          { label: "total tokens", value: totals.tokens.toLocaleString() },
          { label: "avg latency", value: `${avgMs} ms` },
          { label: "spend", value: `$${totals.usd.toFixed(6)}` },
        ].map((s) => (
          <div key={s.label} className="rounded border border-border/60 bg-background/50 p-3">
            <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-mono text-sm text-accent">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        PKR equivalent:{" "}
        <span className="font-mono text-primary">Rs {totals.pkr.toFixed(4)}</span>{" "}
        @ {PKR_PER_USD} PKR/USD
      </p>

      <ul className="mt-3 max-h-44 space-y-1 overflow-auto font-mono text-[11px]">
        {samples.length === 0 && <li className="text-muted-foreground">no metered calls yet</li>}
        {samples.map((s) => (
          <li key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-1">
            <span className="text-accent">{s.model}</span>
            <span className="text-muted-foreground">
              {s.promptTokens}↑ {s.completionTokens}↓ · {s.latencyMs}ms · ${s.usd.toFixed(6)} · Rs{" "}
              {s.pkr.toFixed(4)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}