import { BadgeCheck, ExternalLink } from "lucide-react";
import { Panel } from "./Panel";
import type { Citation } from "@/types/accuracy";
import { cn } from "@/lib/utils";

export function CitationBadges({
  citations,
  onToggle,
}: {
  citations: Citation[];
  onToggle: (id: string) => void;
}) {
  return (
    <Panel icon={BadgeCheck} title="Real-Time Fact Citation Badges" badge={`${citations.filter((c) => c.verified).length} verified`}>
      {citations.length === 0 ? (
        <p className="rounded border border-dashed border-border px-3 py-4 text-[11px] text-muted-foreground">
          Citation nodes appear once fact-checking begins.
        </p>
      ) : (
        <ul className="space-y-2">
          {citations.map((c) => (
            <li key={c.id}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded border px-3 py-2 transition-all",
                  c.verified ? "border-accent/70 bg-accent/10" : "border-border",
                )}
              >
                <button
                  onClick={() => onToggle(c.id)}
                  className="min-w-0 flex-1 text-left"
                  aria-label={`Toggle verification for ${c.label}`}
                >
                  <span className="block truncate text-[11px] font-semibold">{c.label}</span>
                  <span className="block truncate text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.source} · trust {(c.trust * 100).toFixed(0)}%
                  </span>
                </button>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open source ${c.label}`}
                  className="text-accent hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
