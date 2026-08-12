import { Waves } from "lucide-react";
import { Panel } from "./Panel";

export function DriftMonitor({ drift, prompt }: { drift: number; prompt: string }) {
  const points = Array.from({ length: 28 }, (_, i) => {
    const y = 30 - Math.sin(i * 0.7) * (drift / 4) - (i > 20 ? drift / 3 : 0);
    return `${(i / 27) * 100},${Math.max(2, Math.min(58, y + 15))}`;
  }).join(" ");
  const alert = drift > 18;

  return (
    <Panel icon={Waves} title="Semantic Drift Monitor" badge={alert ? "drift alert" : "locked on"}>
      <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        anchor: {prompt || "no context anchored"}
      </p>
      <svg viewBox="0 0 100 60" className="mt-3 h-24 w-full rounded border border-border bg-background/60">
        <line x1="0" y1="45" x2="100" y2="45" stroke="#FF003355" strokeWidth="0.4" strokeDasharray="2 2" />
        <polyline
          points={points}
          fill="none"
          stroke={alert ? "#FF0033" : "#9D00FF"}
          strokeWidth="1.2"
        />
      </svg>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {alert
          ? "Context divergence exceeds tolerance — re-anchoring to the original directive."
          : "Response vector remains aligned with the original directive."}
      </p>
    </Panel>
  );
}
