import { Activity, BatteryCharging, BatteryMedium, Cpu, Grid2x2, MemoryStick, Search, ShieldAlert, Wifi } from "lucide-react";
import { useBrowserCapabilities } from "@/hooks/useBrowserCapabilities";
import { useBattery, useTelemetry } from "@/hooks/useTelemetry";
import { useSystemStore } from "@/store/useSystemStore";
import { cn } from "@/lib/utils";

function Meter({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Cpu; tone: "crimson" | "neon" }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-3.5 w-3.5", tone === "crimson" ? "text-primary" : "text-accent")} />
      <span className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
        {label}
      </span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all duration-500", tone === "crimson" ? "bg-primary" : "bg-accent")}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-[10px] tabular-nums text-foreground/80">{value}%</span>
    </div>
  );
}

export function TelemetryHeader() {
  const caps = useBrowserCapabilities();
  const t = useTelemetry();
  const battery = useBattery(caps.battery);
  const { matrixRain, toggleMatrixRain, setPanic, setPaletteOpen } = useSystemStore();

  return (
    <header className="hud-panel sticky top-0 z-30 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold text-glow-crimson">DEVIL</span>
        <span className="hidden text-[10px] uppercase tracking-[0.3em] text-accent text-glow-neon md:inline">
          rogue os
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span className="text-[11px] tabular-nums text-foreground/80">{t.fps} FPS</span>
      </div>

      <Meter label="cpu" value={t.cpu} icon={Cpu} tone="crimson" />
      <Meter label="ram" value={t.ram} icon={MemoryStick} tone="neon" />

      <div className="flex items-center gap-1.5">
        <Wifi className="h-3.5 w-3.5 text-accent" />
        <span className="text-[11px] tabular-nums text-foreground/80">{t.latency}ms</span>
      </div>

      <div className="flex items-center gap-1.5">
        {battery.charging ? (
          <BatteryCharging className="h-3.5 w-3.5 text-accent" />
        ) : (
          <BatteryMedium className="h-3.5 w-3.5 text-primary" />
        )}
        <span className="text-[11px] tabular-nums text-foreground/80">
          {Math.round(battery.level * 100)}%
        </span>
        {!battery.supported && (
          <span className="text-[9px] uppercase text-muted-foreground">mock</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Search className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Ctrl</span>+K
        </button>
        <button
          onClick={toggleMatrixRain}
          className={cn(
            "flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] transition-colors",
            matrixRain
              ? "border-accent text-accent ring-glow"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Grid2x2 className="h-3.5 w-3.5" /> RAIN
        </button>
        <button
          onClick={() => setPanic(true)}
          className="rounded border border-primary bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary ring-glow transition-colors hover:bg-primary/30"
        >
          Panic
        </button>
      </div>
    </header>
  );
}