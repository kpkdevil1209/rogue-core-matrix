import { createFileRoute } from "@tanstack/react-router";
import { ScanText } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/multimodal")({
  head: () => ({
    meta: [
      { title: "Multimodal, OCR & File Suite — DEVIL" },
      { name: "description", content: "Vision, OCR and document pipelines for ingesting any artifact the operator drops in." },
      { property: "og:title", content: "Multimodal, OCR & File Suite — DEVIL" },
      { property: "og:description", content: "Vision, OCR and document pipelines for ingesting any artifact the operator drops in." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={ScanText}
        tag="CAT 05"
        title="Multimodal, OCR & File Suite"
        description="Vision, OCR and document pipelines for ingesting any artifact the operator drops in."
        capabilities={["OCR Pipeline","Image Reasoning","PDF Extractor","Audio Ingest","Batch Converter","Asset Library"]}
      />
    </Shell>
  ),
});
