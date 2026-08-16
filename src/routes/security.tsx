import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { SecurityStudio } from "@/components/security/SecurityStudio";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Cybersecurity, WAF & Vault — DEVIL" },
      { name: "description", content: "Sentinel WAF, intrusion heuristics and an encrypted local vault for credentials and payloads." },
      { property: "og:title", content: "Cybersecurity, WAF & Vault — DEVIL" },
      { property: "og:description", content: "Sentinel WAF, intrusion heuristics and an encrypted local vault for credentials and payloads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell>
      <SecurityStudio />
    </Shell>
  ),
});
