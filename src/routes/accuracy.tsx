import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/accuracy")({
  head: () => ({
    meta: [
      { title: "Zero-Hallucination & Accuracy Engine — DEVIL" },
      { name: "description", content: "Multi-pass verification lattice, source cross-checking and confidence scoring for every DEVIL output." },
      { property: "og:title", content: "Zero-Hallucination & Accuracy Engine — DEVIL" },
      { property: "og:description", content: "Multi-pass verification lattice, source cross-checking and confidence scoring for every DEVIL output." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={Bot}
        tag="CAT 01"
        title="Zero-Hallucination & Accuracy Engine"
        description="Multi-pass verification lattice, source cross-checking and confidence scoring for every DEVIL output."
        capabilities={["Triple-Pass Verifier","Citation Enforcer","Confidence Scoring","Contradiction Detector","Fact Cache","Self-Critique Loop"]}
      />
    </Shell>
  ),
});
