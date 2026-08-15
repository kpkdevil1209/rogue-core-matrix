import { useState } from "react";
import { ShieldHalf } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { WAF_SAMPLES, inspect } from "@/lib/waf";
import type { WafLogEntry } from "@/types/security";

export function WafPanel() {
  const [input, setInput] = useState(WAF_SAMPLES[0]!.payload);
  const [log, setLog] = useState<WafLogEntry[]>([]);
  const verdict = inspect(input);

  const commit = () => {
    setLog((l) =>
      [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), input, verdict },
        ...l,
      ].slice(0, 25),
    );
  };

  return (
    <Panel icon={ShieldHalf} title="Client-Side WAF Sentinel" tag="live inspection">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-xs outline-none focus:border-accent"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {WAF_SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => setInput(s.payload)}
            className="rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {s.label}
          </button>
        ))}
        <ActionButton variant="primary" onClick={commit}>
          Inspect &amp; Log
        </ActionButton>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div
          className={`rounded border p-3 text-center ${verdict.blocked ? "border-primary bg-primary/10" : "border-accent bg-accent/10"}`}
        >
          <p
            className={`text-lg font-bold uppercase tracking-[0.2em] ${verdict.blocked ? "text-primary text-glow-crimson" : "text-accent"}`}
          >
            {verdict.blocked ? "blocked" : "allowed"}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            threat score {verdict.score}
          </p>
          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded bg-background">
            <div
              className={verdict.blocked ? "h-full bg-primary" : "h-full bg-accent"}
              style={{ width: `${verdict.score}%` }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          {verdict.vectors.map((v, i) => (
            <p key={i} className="font-mono text-[11px] text-muted-foreground">
              <span className="text-primary">{v.vector}</span> · {v.pattern}
              {v.match ? <span className="text-accent"> → {v.match}</span> : null}
            </p>
          ))}
          <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            sanitized output
          </p>
          <pre className="overflow-auto rounded border border-border/60 bg-background/70 p-2 font-mono text-[11px] text-accent">
            {verdict.sanitized || "(empty after sanitization)"}
          </pre>
        </div>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        intrusion ledger
      </p>
      <ul className="mt-1.5 max-h-40 space-y-1 overflow-auto font-mono text-[11px]">
        {log.length === 0 && <li className="text-muted-foreground">no events recorded</li>}
        {log.map((e) => (
          <li key={e.id} className="truncate">
            <span className="text-muted-foreground">
              {new Date(e.at).toLocaleTimeString()}{" "}
            </span>
            <span className={e.verdict.blocked ? "text-primary" : "text-accent"}>
              [{e.verdict.blocked ? "DENY" : "PASS"} {e.verdict.score}]
            </span>{" "}
            <span className="text-muted-foreground">{e.input.slice(0, 70)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}