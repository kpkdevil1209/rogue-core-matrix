import { useEffect, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { MatrixRain } from "./MatrixRain";
import { PanicOverlay } from "./PanicOverlay";
import { Sidebar } from "./Sidebar";
import { TelemetryHeader } from "./TelemetryHeader";
import { useBrowserCapabilities } from "@/hooks/useBrowserCapabilities";
import { useSystemStore } from "@/store/useSystemStore";

export function Shell({ children }: { children: ReactNode }) {
  const caps = useBrowserCapabilities();
  const { panic, matrixRain, setPanic, setPaletteOpen, paletteOpen, toggleSidebar } =
    useSystemStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanic(true);
        setPaletteOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen, setPanic]);

  if (panic) return <PanicOverlay />;

  return (
    <div className="relative min-h-screen bg-background">
      <MatrixRain enabled={matrixRain && caps.canvas} />
      <div className="pointer-events-none fixed inset-0 z-0 scan-line opacity-40" />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TelemetryHeader />
          <button
            onClick={toggleSidebar}
            className="m-3 flex w-fit items-center gap-2 rounded border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-accent lg:hidden"
          >
            <Menu className="h-3.5 w-3.5" /> Modules
          </button>
          <main className="min-w-0 flex-1 p-4 pb-16 sm:p-6">{children}</main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}