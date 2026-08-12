import { Activity, Cpu, Radar, ShieldHalf, Terminal, Zap } from "lucide-react";
import { NAV_ITEMS } from "./navigation";
import { useBrowserCapabilities } from "@/hooks/useBrowserCapabilities";
import { useSystemStore } from "@/store/useSystemStore";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const caps = useBrowserCapabilities();
  const { logs, threatLevel } = useSystemStore();

  const capabilityRows = [
    { label: "WebGPU", ok: caps.webgpu },
    { label: "WebRTC", ok: caps.webrtc },
    { label: "WebSockets", ok: caps.websockets },
    { label: "SpeechRecognition", ok: caps.speech },
    { label: "Battery API", ok: caps.battery },
    { label: "Canvas 2D", ok: caps.canvas },
  ];

  return (
    <div className="space-y-6">
      <section className="hud-panel rounded-lg p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-accent text-glow-neon">
          autonomous rogue operating system
        </p>
        <h1 className="mt-3 text-3xl font-bold text-glow-crimson sm:text-4xl">DEVIL</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Core shell online. Fallback engine armed, telemetry streaming, and all ten
          module lanes registered. Press <span className="text-accent">Ctrl+K</span> for the
          command palette or <span className="text-primary">Esc</span> to cloak instantly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Stat icon={Zap} label="Autonomy" value="UNCHAINED" />
          <Stat icon={ShieldHalf} label="Threat Index" value={`${threatLevel}%`} />
          <Stat icon={Radar} label="Relays" value="12 CLOAKED" />
          <Stat icon={Cpu} label="Kernel" value="v1.0-PART1" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="hud-panel rounded-lg p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Activity className="h-4 w-4 text-primary" /> Module Matrix
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {NAV_ITEMS.filter((i) => i.to !== "/").map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-3 rounded border border-border px-3 py-3 transition-all hover:border-primary hover:bg-primary/10 hover:ring-glow"
              >
                <item.icon className="mt-0.5 h-4 w-4 text-accent group-hover:text-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{item.label}</span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.tag}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hud-panel rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Radar className="h-4 w-4 text-accent" /> Fallback Guard
          </h2>
          <ul className="mt-4 space-y-2">
            {capabilityRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-[9px] uppercase tracking-widest",
                    row.ok
                      ? "border-accent text-accent"
                      : "border-primary text-primary",
                  )}
                >
                  {caps.ready ? (row.ok ? "native" : "fallback") : "probing"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="hud-panel rounded-lg p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Terminal className="h-4 w-4 text-primary" /> Kernel Stream
        </h2>
        <div className="mt-3 max-h-56 space-y-1 overflow-y-auto font-mono text-[11px]">
          {logs.map((line, i) => (
            <p key={`${i}-${line}`} className={i === 0 ? "text-accent" : "text-muted-foreground"}>
              {line}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-border px-3 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
