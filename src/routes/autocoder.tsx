import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

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
      <ModuleScaffold
        icon={Code2}
        tag="CAT 02"
        title="Auto-Coder & Web Worker Sandbox"
        description="Autonomous code synthesis executed inside isolated Web Worker sandboxes with instant rollback."
        capabilities={["Worker Sandbox","Live Transpiler","Diff Engine","Dependency Resolver","Test Runner","Rollback Vault"]}
      />
    </Shell>
  ),
});
