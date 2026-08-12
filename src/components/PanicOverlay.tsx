import { Mic, Search } from "lucide-react";
import { useSystemStore } from "@/store/useSystemStore";

export function PanicOverlay() {
  const setPanic = useSystemStore((s) => s.setPanic);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center bg-white pt-28 text-neutral-800">
      <div className="text-6xl font-normal tracking-tight">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>
      <div className="mt-8 flex w-[min(92vw,580px)] items-center gap-3 rounded-full border border-neutral-200 px-5 py-3 shadow-sm">
        <Search className="h-5 w-5 text-neutral-400" />
        <input
          autoFocus
          className="flex-1 bg-transparent text-base outline-none"
          placeholder="Search Google or type a URL"
        />
        <Mic className="h-5 w-5 text-[#4285F4]" />
      </div>
      <div className="mt-8 flex gap-3">
        <button className="rounded border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          Google Search
        </button>
        <button className="rounded border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          I'm Feeling Lucky
        </button>
      </div>
      <button
        onClick={() => setPanic(false)}
        className="mt-16 text-xs text-neutral-400 underline"
      >
        restore session
      </button>
    </div>
  );
}