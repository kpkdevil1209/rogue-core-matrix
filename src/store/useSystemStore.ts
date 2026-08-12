import { create } from "zustand";

interface SystemState {
  panic: boolean;
  matrixRain: boolean;
  paletteOpen: boolean;
  sidebarOpen: boolean;
  threatLevel: number;
  logs: string[];
  setPanic: (v: boolean) => void;
  togglePanic: () => void;
  toggleMatrixRain: () => void;
  setPaletteOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  pushLog: (line: string) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  panic: false,
  matrixRain: true,
  paletteOpen: false,
  sidebarOpen: false,
  threatLevel: 87,
  logs: [
    "[BOOT] DEVIL kernel online — autonomy layer unlocked",
    "[NET] 12 relay nodes cloaked",
    "[SEC] WAF sentinel armed",
  ],
  setPanic: (v) => set({ panic: v }),
  togglePanic: () => set((s) => ({ panic: !s.panic })),
  toggleMatrixRain: () => set((s) => ({ matrixRain: !s.matrixRain })),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  pushLog: (line) => set((s) => ({ logs: [line, ...s.logs].slice(0, 40) })),
}));