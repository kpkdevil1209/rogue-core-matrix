import { createFileRoute } from "@tanstack/react-router";
import { ShieldHalf } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ModuleScaffold } from "@/components/ModuleScaffold";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Cybersecurity, WAF & Vault — DEVIL" },
      { name: "description", content: "Sentinel WAF, intrusion heuristics and an encrypted local vault for credentials and payloads." },
      { property: "og:title", content: "Cybersecurity, WAF & Vault — DEVIL" },
      { property: "og:description", content: "Sentinel WAF, intrusion heuristics and an encrypted local vault for credentials and payloads." },
    ],
  }),
  component: () => (
    <Shell>
      <ModuleScaffold
        icon={ShieldHalf}
        tag="CAT 04/13"
        title="Cybersecurity, WAF & Vault"
        description="Sentinel WAF, intrusion heuristics and an encrypted local vault for credentials and payloads."
        capabilities={["Sentinel WAF","Intrusion Heuristics","Encrypted Vault","Port Scanner","Payload Analyzer","Audit Ledger"]}
      />
    </Shell>
  ),
});
