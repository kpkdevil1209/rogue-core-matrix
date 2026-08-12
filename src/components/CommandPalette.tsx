import { useNavigate } from "@tanstack/react-router";
import { Command, CornerDownLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NAV_ITEMS } from "./navigation";
import { useSystemStore } from "@/store/useSystemStore";
import type { SystemCommand } from "@/types/system";

export function CommandPalette() {
  const navigate = useNavigate();
  const { paletteOpen, setPaletteOpen, toggleMatrixRain, setPanic, pushLog } =
    useSystemStore();
  const [query, setQuery] = useState("");

  const commands = useMemo<SystemCommand[]>(
    () => [
      ...NAV_ITEMS.map((item) => ({
        id: `go-${item.to}`,
        label: `Go to ${item.label}`,
        hint: item.tag,
        run: () => navigate({ to: item.to }),
      })),
      {
        id: "toggle-rain",
        label: "Toggle Matrix Code Rain",
        hint: "render",
        run: toggleMatrixRain,
      },
      {
        id: "panic",
        label: "Engage Panic Cloak",
        hint: "esc",
        run: () => setPanic(true),
      },
      {
        id: "purge",
        label: "Purge Volatile Memory Buffers",
        hint: "kernel",
        run: () => pushLog("[KERNEL] volatile buffers purged"),
      },
    ],
    [navigate, pushLog, setPanic, toggleMatrixRain],
  );

  const results = commands.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!paletteOpen) setQuery("");
  }, [paletteOpen]);

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-background/85 px-4 pt-28 backdrop-blur-sm">
      <button
        aria-label="Close command palette"
        className="absolute inset-0"
        onClick={() => setPaletteOpen(false)}
      />
      <div className="hud-panel relative w-full max-w-xl rounded-lg">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Command className="h-4 w-4 text-primary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                results[0].run();
                setPaletteOpen(false);
              }
            }}
            placeholder="Execute system command…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              No matching protocol
            </li>
          )}
          {results.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  c.run();
                  setPaletteOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-xs transition-colors hover:bg-accent/15 hover:text-accent"
              >
                <span>{c.label}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {c.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}