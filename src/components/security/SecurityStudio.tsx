import { useState } from "react";
import { FileCode2, Fingerprint, Gauge, KeyRound, ShieldHalf } from "lucide-react";
import { ContractAuditor } from "./ContractAuditor";
import { CostAnalytics } from "./CostAnalytics";
import { ForensicsDeck } from "./ForensicsDeck";
import { VaultPanel } from "./VaultPanel";
import { WafPanel } from "./WafPanel";

const TABS = [
  { id: "waf", label: "Sentinel WAF", icon: ShieldHalf },
  { id: "vault", label: "Key Vault", icon: KeyRound },
  { id: "audit", label: "Contract Auditor", icon: FileCode2 },
  { id: "cost", label: "Cost Analytics", icon: Gauge },
  { id: "forensics", label: "Cyber Forensics", icon: Fingerprint },
] as const;

export function SecurityStudio() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("waf");

  return (
    <div className="space-y-6">
      <section className="hud-panel rounded-lg p-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-glow-neon">cat 04</p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-glow-crimson">
          <ShieldHalf className="h-6 w-6 text-primary" />
          Security Audit, Ethical Hacking &amp; Cipher Suite
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A fully local offensive-defense stack: AES-256-GCM key vault, real-time WAF against SQLi,
          XSS and prompt-injection vectors, a Solidity vulnerability auditor, token/cost telemetry in
          USD and PKR, and a forensics deck spanning CIDR math, hashing, JWT inspection, port sweeps,
          codecs and LSB steganography.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                tab === t.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "waf" && <WafPanel />}
      {tab === "vault" && <VaultPanel />}
      {tab === "audit" && <ContractAuditor />}
      {tab === "cost" && <CostAnalytics />}
      {tab === "forensics" && <ForensicsDeck />}
    </div>
  );
}