import { createFileRoute } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Productivity, Diagnostics & Thermals — DEVIL" },
      { name: "description", content: "Task orchestration alongside deep device diagnostics and thermal throttle awareness." },
      { property: "og:title", content: "Productivity, Diagnostics & Thermals — DEVIL" },
      { property: "og:description", content: "Task orchestration alongside deep device diagnostics and thermal throttle awareness." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={Gauge}
        tag="CAT 08/22"
        title="Productivity, Diagnostics & Thermals"
        description="Task orchestration alongside deep device diagnostics and thermal throttle awareness."
        capabilities={["Task Orchestrator","Thermal Monitor","Frame Profiler","Memory Leak Scan","Focus Timer","Health Report"]}
      />
    </Shell>
  ),
});
