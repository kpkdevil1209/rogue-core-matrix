import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/protocols")({
  head: () => ({
    meta: [
      { title: "Gamified Rogue Protocols & Hotkeys — DEVIL" },
      { name: "description", content: "XP-driven rogue protocols, achievement tiers and a fully remappable hotkey grid." },
      { property: "og:title", content: "Gamified Rogue Protocols & Hotkeys — DEVIL" },
      { property: "og:description", content: "XP-driven rogue protocols, achievement tiers and a fully remappable hotkey grid." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={Trophy}
        tag="CAT 09/23"
        title="Gamified Rogue Protocols & Hotkeys"
        description="XP-driven rogue protocols, achievement tiers and a fully remappable hotkey grid."
        capabilities={["XP Engine","Achievement Tiers","Hotkey Grid","Daily Contracts","Leaderboard","Protocol Forge"]}
      />
    </Shell>
  ),
});
