import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { AutoCoderStudio } from "@/components/autocoder/AutoCoderStudio";

export const Route = createFileRoute("/autocoder")({
  head: () => ({
    meta: [
      { title: "Auto-Coder & Web Worker Sandbox — DEVIL" },
      { name: "description", content: "Autonomous code synthesis executed inside isolated Web Worker sandboxes with instant rollback." },
      { property: "og:title", content: "Auto-Coder & Web Worker Sandbox — DEVIL" },
      { property: "og:description", content: "Autonomous code synthesis executed inside isolated Web Worker sandboxes with instant rollback." },
    ],
  }),
  component: () => (
    <Shell>
      <AutoCoderStudio />
    </Shell>
  ),
});
