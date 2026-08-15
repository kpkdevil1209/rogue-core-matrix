import { useMemo, useState } from "react";
import { FileCode2, ShieldAlert } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { SAMPLE_CONTRACT, auditSolidity } from "@/lib/solidityAudit";
import type { AuditSeverity } from "@/types/security";

const SEV_STYLE: Record<AuditSeverity, string> = {
  critical: "border-primary text-primary",
  high: "border-primary/60 text-primary/80",
  medium: "border-accent text-accent",
  low: "border-border text-muted-foreground",
  gas: "border-accent/50 text-accent/80",
};

export function ContractAuditor() {
  const [source, setSource] = useState(SAMPLE_CONTRACT);
  const [ran, setRan] = useState(false);
  const report = useMemo(() => auditSolidity(source), [source]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of report.findings) c[f.severity] = (c[f.severity] ?? 0) + 1;
    return c;
  }, [report]);

  return (
    <Panel icon={FileCode2} title="Autonomous Smart Contract Auditor" tag="solidity">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full resize-y rounded border border-border bg-background/70 p-3 font-mono text-[11px] leading-relaxed outline-none focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={() => setRan(true)}>
              <ShieldAlert className="h-3.5 w-3.5" /> Run Audit
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => setSource(SAMPLE_CONTRACT)}>
              Load Vulnerable Sample
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => { setSource(""); setRan(false); }}>
              Clear
            </ActionButton>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 rounded border border-border/60 bg-background/50 p-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-glow-crimson">{ran ? report.score : "—"}</p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                safety score
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["critical", "high", "medium", "low", "gas"] as AuditSeverity[]).map((s) => (
                <span
                  key={s}
                  className={`rounded border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${SEV_STYLE[s]}`}
                >
                  {s} {ran ? (counts[s] ?? 0) : 0}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-3 max-h-[19rem] space-y-2 overflow-auto pr-1">
            {!ran && (
              <li className="rounded border border-border/60 p-3 text-center text-[11px] text-muted-foreground">
                Audit not executed — 12 detectors idle
              </li>
            )}
            {ran && report.findings.length === 0 && (
              <li className="rounded border border-accent/60 p-3 text-center text-[11px] text-accent">
                No signatures matched — contract clean against loaded detectors
              </li>
            )}
            {ran &&
              report.findings.map((f) => (
                <li key={f.id} className="rounded border border-border/60 bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em]">{f.title}</p>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${SEV_STYLE[f.severity]}`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-accent">line {f.line}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{f.detail}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-accent/80">→ {f.remediation}</p>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}