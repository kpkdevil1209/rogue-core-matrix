import { useState } from "react";
import { Bot, Play, RotateCcw } from "lucide-react";
import { AccuracyHud } from "./AccuracyHud";
import { AmbiguityResolver } from "./AmbiguityResolver";
import { CitationBadges } from "./CitationBadges";
import { ConsensusPanel } from "./ConsensusPanel";
import { DriftMonitor } from "./DriftMonitor";
import { GuardrailPanel } from "./GuardrailPanel";
import { LogicMatrix } from "./LogicMatrix";
import { MonteCarloGraph } from "./MonteCarloGraph";
import { SwarmRouter } from "./SwarmRouter";
import { useAccuracyEngine } from "@/hooks/useAccuracyEngine";

export function AccuracyEngine() {
  const { state, run, reset, setModel, setPrompt, toggleCitation } = useAccuracyEngine();
  const [draft, setDraft] = useState("");
  const busy = state.stage !== "idle" && state.stage !== "done" && state.stage !== "ambiguity";

  const submit = () => {
    setPrompt(draft);
    run(draft);
  };

  return (
    <div className="space-y-6">
      <section className="hud-panel rounded-lg p-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-glow-neon">cat 01</p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-glow-crimson">
          <Bot className="h-6 w-6 text-primary" />
          Zero-Hallucination & Accuracy Engine
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          One thousand reasoning branches simulated, contradictions purged, every surviving claim
          bound to a verified source node before a single word reaches the operator.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Enter directive for the accuracy lattice…"
            className="flex-1 rounded border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />
          <button
            onClick={submit}
            disabled={busy || draft.trim().length === 0}
            className="flex items-center justify-center gap-2 rounded border border-primary bg-primary/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/30 disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" />
            {busy ? "Simulating" : "Execute"}
          </button>
          <button
            onClick={() => {
              reset();
              setDraft("");
            }}
            aria-label="Reset engine"
            className="flex items-center justify-center gap-2 rounded border border-border px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </section>

      {state.stage === "ambiguity" && (
        <AmbiguityResolver
          options={state.ambiguityOptions}
          onResolve={(option) => {
            const resolved = `${state.prompt} — ${option}`;
            setDraft(resolved);
            setPrompt(resolved);
            run(resolved, true);
          }}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <MonteCarloGraph
            branches={state.branches}
            simulated={state.simulated}
            stage={state.stage}
          />
          <LogicMatrix steps={state.logic} />
          <ConsensusPanel votes={state.votes} golden={state.golden} />
        </div>
        <div className="space-y-6">
          <AccuracyHud stage={state.stage} confidence={state.confidence} drift={state.drift} />
          <SwarmRouter active={state.activeModel} onSelect={setModel} />
          <CitationBadges citations={state.citations} onToggle={toggleCitation} />
          <DriftMonitor drift={state.drift} prompt={state.prompt} />
        </div>
      </div>

      <GuardrailPanel stage={state.stage} purged={state.purged} />
    </div>
  );
}
