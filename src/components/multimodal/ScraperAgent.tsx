import { useState } from "react";
import { Globe2, Link2, Radar } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { useSystemStore } from "@/store/useSystemStore";

interface Node {
  url: string;
  depth: number;
  status: number;
  bytes: number;
  title: string;
  trust: number;
}

const SEEDS = ["docs", "blog", "research", "wiki", "api", "changelog", "papers", "index"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function ScraperAgent() {
  const [topic, setTopic] = useState("autonomous agent swarms");
  const [depth, setDepth] = useState(3);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [running, setRunning] = useState(false);
  const pushLog = useSystemStore((s) => s.pushLog);

  const crawl = () => {
    setNodes([]);
    setRunning(true);
    const slug = topic.trim().toLowerCase().replace(/\s+/g, "-") || "target";
    const plan: Node[] = [];
    for (let d = 1; d <= depth; d += 1) {
      for (let i = 0; i < 3; i += 1) {
        const seed = SEEDS[(hash(slug + d + i) + i) % SEEDS.length]!;
        const host = `${seed}.${["ieee.org", "arxiv.org", "acm.org", "openreview.net", "nature.com"][(hash(seed + d) + i) % 5]}`;
        const h = hash(host + slug + d + i);
        plan.push({
          url: `https://${host}/${slug}/${d}-${i}`,
          depth: d,
          status: [200, 200, 200, 301, 403][h % 5]!,
          bytes: 4000 + (h % 90000),
          title: `${topic} — ${seed} dossier ${d}.${i}`,
          trust: 60 + (h % 40),
        });
      }
    }
    plan.forEach((n, i) => {
      window.setTimeout(() => {
        setNodes((prev) => [...prev, n]);
        pushLog(`[CRAWL] ${n.status} ${n.url}`);
        if (i === plan.length - 1) setRunning(false);
      }, 180 * (i + 1));
    });
  };

  const cited = nodes.filter((n) => n.status === 200).sort((a, b) => b.trust - a.trust).slice(0, 6);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel icon={Radar} title="Deep Web Crawl Lattice" tag={running ? "CRAWLING" : `${nodes.length} nodes`}>
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-w-[12rem] flex-1 rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
          />
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            depth
            <input
              type="number"
              min={1}
              max={5}
              value={depth}
              onChange={(e) => setDepth(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
              className="ml-2 w-14 rounded border border-border bg-background/70 px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-accent"
            />
          </label>
          <ActionButton onClick={crawl} disabled={running}>
            <Globe2 className="h-3.5 w-3.5" /> Dispatch agent
          </ActionButton>
        </div>

        <div className="mt-3 max-h-72 space-y-1.5 overflow-auto">
          {nodes.map((n) => (
            <div key={n.url} className="rounded border border-border/60 bg-background/60 p-2">
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em]">
                <span className={n.status === 200 ? "text-accent" : "text-primary"}>HTTP {n.status}</span>
                <span className="text-muted-foreground">d{n.depth} · {(n.bytes / 1024).toFixed(1)} KB · trust {n.trust}%</span>
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{n.url}</p>
              <div className="mt-1.5 h-1 rounded bg-border/60">
                <div className="h-full rounded bg-primary" style={{ width: `${n.trust}%` }} />
              </div>
            </div>
          ))}
          {!nodes.length ? <p className="text-[11px] text-muted-foreground">Agent idle.</p> : null}
        </div>
      </Panel>

      <Panel icon={Link2} title="Source Citation Badges" tag="RANKED">
        <ul className="space-y-2">
          {cited.map((n, i) => (
            <li key={n.url} className="rounded border border-accent/40 bg-accent/5 p-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-accent">
                <span>[{i + 1}] trust {n.trust}%</span>
                <span className="text-muted-foreground">depth {n.depth}</span>
              </div>
              <p className="mt-1 text-[11px] text-foreground">{n.title}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{n.url}</p>
            </li>
          ))}
          {!cited.length ? (
            <li className="text-[11px] text-muted-foreground">Citations appear once the crawl returns 200s.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}