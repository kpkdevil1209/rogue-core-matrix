import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { AccuracyEngine } from "@/components/accuracy/AccuracyEngine";

export const Route = createFileRoute("/accuracy")({
  head: () => ({
    meta: [
      { title: "Zero-Hallucination & Accuracy Engine — DEVIL" },
      {
        name: "description",
        content:
          "1000x Monte-Carlo reasoning simulation, guardrail cross-checks, swarm consensus and live confidence scoring inside DEVIL OS.",
      },
      { property: "og:title", content: "Zero-Hallucination & Accuracy Engine — DEVIL" },
      {
        property: "og:description",
        content: "Monte-Carlo reasoning graph, logic verification matrix and golden consensus answers.",
      },
    ],
  }),
  component: () => (
    <Shell>
      <AccuracyEngine />
    </Shell>
  ),
});
