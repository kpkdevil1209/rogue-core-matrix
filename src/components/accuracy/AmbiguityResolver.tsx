import { HelpCircle } from "lucide-react";
import { Panel } from "./Panel";

export function AmbiguityResolver({
  options,
  onResolve,
}: {
  options: string[];
  onResolve: (option: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <Panel icon={HelpCircle} title="Ambiguity Resolver" badge="intent unclear" className="border-primary/70">
      <p className="text-[11px] text-muted-foreground">
        Intent confidence below threshold. Select an interpretation and DEVIL will re-run the full
        simulation lattice.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onResolve(o)}
            className="rounded border border-border px-3 py-2 text-left text-[11px] transition-all hover:border-primary hover:bg-primary/10 hover:ring-glow"
          >
            {o}
          </button>
        ))}
      </div>
    </Panel>
  );
}
