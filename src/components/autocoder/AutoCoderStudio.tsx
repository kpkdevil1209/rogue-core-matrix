import { useState } from "react";
import { Code2, Cpu, Users, Wrench } from "lucide-react";
import { AgentHive } from "./AgentHive";
import { SandboxStudio } from "./SandboxStudio";
import { ToolDeck } from "./ToolDeck";

const TABS = [
  { id: "sandbox", label: "Sandbox", icon: Cpu },
  { id: "hive", label: "Agent Hive", icon: Users },
  { id: "tools", label: "Dev Toolchain", icon: Wrench },
] as const;

export function AutoCoderStudio() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("sandbox");

  return (
    <div className="space-y-6">
      <section className="hud-panel rounded-lg p-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-glow-neon">cat 02</p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-glow-crimson">
          <Code2 className="h-6 w-6 text-primary" />
          Autonomous Development & Background Sandbox
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Code compiled inside an isolated Web Worker, rendered in a sealed viewport, mutated
          automatically when it faults, and packaged into offline artifacts — with a hive of up to
          100 parallel agents and a full autonomous toolchain.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                tab === t.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "sandbox" ? <SandboxStudio /> : tab === "hive" ? <AgentHive /> : <ToolDeck />}
    </div>
  );
}
