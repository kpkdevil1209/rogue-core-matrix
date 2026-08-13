import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { VoiceStudio } from "@/components/voice/VoiceStudio";

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
      <VoiceStudio />
    </Shell>
  ),
});
