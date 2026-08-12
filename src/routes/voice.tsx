import { createFileRoute } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice Mode & Mobile Action Bridge — DEVIL" },
      { name: "description", content: "Hands-free voice command channel with graceful fallback when SpeechRecognition is unavailable." },
      { property: "og:title", content: "Voice Mode & Mobile Action Bridge — DEVIL" },
      { property: "og:description", content: "Hands-free voice command channel with graceful fallback when SpeechRecognition is unavailable." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={Mic}
        tag="CAT 03"
        title="Voice Mode & Mobile Action Bridge"
        description="Hands-free voice command channel with graceful fallback when SpeechRecognition is unavailable."
        capabilities={["Wake Word Listener","Streaming Transcription","Voice Synthesis","Mobile Action Bridge","Offline Queue","Noise Gate"]}
      />
    </Shell>
  ),
});
