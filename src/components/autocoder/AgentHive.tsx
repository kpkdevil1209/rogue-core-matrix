import { useEffect, useRef, useState } from "react";
import { Bot, Pause, Play, Users } from "lucide-react";
import { ActionButton, Panel } from "./Panel";

const ROLES = ["Coder", "Researcher", "Designer", "Auditor", "Tester"] as const;
type Role = (typeof ROLES)[number];

interface Agent {
  id: number;
  role: Role;
  progress: number;
  task: string;
}

const TASKS: Record<Role, string[]> = {
  Coder: ["scaffolding module", "transpiling worker bundle", "patching diff hunk"],
  Researcher: ["scraping spec corpus", "ranking source nodes", "summarising RFC"],
  Designer: ["deriving token palette", "laying out HUD grid", "tuning glow curve"],
  Auditor: ["scanning for injection", "verifying RLS policy", "diffing supply chain"],
  Tester: ["fuzzing input surface", "running snapshot suite", "measuring TTI"],
};

export function AgentHive() {
  const [count, setCount] = useState(24);
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [feed, setFeed] = useState<string[]>([]);
  const seq = useRef(0);

  const deploy = () => {
    seq.current = 0;
    setAgents(
      Array.from({ length: count }, (_, i) => {
        const role = ROLES[i % ROLES.length]!;
        return { id: i + 1, role, progress: 0, task: TASKS[role][i % 3]! };
      }),
    );
    setFeed([`[HIVE] ${count} workers spawned across 5 role classes`]);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          const next = Math.min(100, a.progress + 2 + Math.random() * 9);
          if (a.progress < 100 && next >= 100) {
            setFeed((f) => [`[W-${String(a.id).padStart(3, "0")}] ${a.role} :: ${a.task} → complete`, ...f].slice(0, 60));
          }
          return { ...a, progress: next };
        }),
      );
    }, 300);
    return () => clearInterval(t);
  }, [running]);

  const done = agents.filter((a) => a.progress >= 100).length;

  return (
    <div className="space-y-4">
      <Panel icon={Users} title="Infinite Autonomous Agent Hive" tag="feat 14">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Workers
            <input
              type="range"
              min={5}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-40 accent-primary"
            />
            <span className="font-mono text-sm text-accent">{count}</span>
          </label>
          <ActionButton onClick={deploy}>
            <Bot className="h-3.5 w-3.5" /> Deploy hive
          </ActionButton>
          <ActionButton onClick={() => setRunning((r) => !r)} variant="ghost" disabled={agents.length === 0}>
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "Halt" : "Resume"}
          </ActionButton>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {done}/{agents.length} tasks complete
          </span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel icon={Bot} title="Worker Lattice">
          <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-auto sm:grid-cols-3">
            {agents.length === 0 ? (
              <p className="col-span-full text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                hive dormant — deploy workers
              </p>
            ) : (
              agents.map((a) => (
                <div key={a.id} className="rounded border border-border/60 bg-background/60 p-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em]">
                    <span className="text-accent">W-{String(a.id).padStart(3, "0")}</span>
                    <span className="text-muted-foreground">{a.role}</span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{a.task}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${a.progress >= 100 ? "bg-accent" : "bg-primary"}`}
                      style={{ width: `${a.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel icon={Bot} title="Hive Terminal">
          <div className="h-[420px] overflow-auto rounded border border-border/60 bg-black/70 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {feed.map((line, i) => (
              <div key={i} className={i === 0 ? "text-accent" : undefined}>
                {line}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
