import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/biometrics")({
  head: () => ({
    meta: [
      { title: "Biometrics & Stealth Dual-UI — DEVIL" },
      { name: "description", content: "WebAuthn biometric gate paired with a dual-surface stealth UI that hides the rogue layer on demand." },
      { property: "og:title", content: "Biometrics & Stealth Dual-UI — DEVIL" },
      { property: "og:description", content: "WebAuthn biometric gate paired with a dual-surface stealth UI that hides the rogue layer on demand." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={Fingerprint}
        tag="CAT 06/10"
        title="Biometrics & Stealth Dual-UI"
        description="WebAuthn biometric gate paired with a dual-surface stealth UI that hides the rogue layer on demand."
        capabilities={["WebAuthn Gate","Face Unlock","Dual-UI Switch","Decoy Workspace","Session Shredder","Presence Watch"]}
      />
    </Shell>
  ),
});
