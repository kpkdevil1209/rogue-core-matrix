import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEVIL — Ultimate Autonomous Rogue AI Operating System" },
      {
        name: "description",
        content:
          "DEVIL is an autonomous rogue AI operating system shell with live telemetry HUD, fallback engine and ten elite module lanes.",
      },
      { property: "og:title", content: "DEVIL — Autonomous Rogue AI OS" },
      {
        property: "og:description",
        content: "Telemetry HUD, matrix code rain, command palette and panic cloak.",
      },
    ],
  }),
  component: () => (
    <Shell>
      <Dashboard />
    </Shell>
  ),
});
