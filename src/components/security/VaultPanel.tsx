import { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Trash2, Unlock } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { useVault } from "@/hooks/useVault";
import { maskSecret } from "@/lib/vaultCrypto";
import type { VaultEntry } from "@/types/security";

const PROVIDERS: VaultEntry["provider"][] = ["groq", "openrouter", "gemini", "custom"];

export function VaultPanel() {
  const vault = useVault();
  const [pass, setPass] = useState("");
  const [provider, setProvider] = useState<VaultEntry["provider"]>("groq");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");

  const unlocked = vault.status === "unlocked";

  return (
    <Panel icon={KeyRound} title="Encrypted Local API Key Vault" tag="AES-256-GCM">
      {!vault.supported && (
        <p className="mb-3 rounded border border-primary/60 bg-primary/10 p-2 text-[11px] text-primary">
          WebCrypto is unavailable here — vault operations are disabled to avoid storing plaintext.
        </p>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[180px]">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Master passphrase
          </span>
          <input
            type="password"
            value={pass}
            disabled={unlocked || !vault.supported}
            onChange={(e) => setPass(e.target.value)}
            placeholder="derived via PBKDF2 · 210k iterations"
            className="w-full rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent disabled:opacity-40"
          />
        </label>
        {unlocked ? (
          <ActionButton variant="ghost" onClick={() => { vault.lock(); setPass(""); }}>
            <Lock className="h-3.5 w-3.5" /> Lock
          </ActionButton>
        ) : (
          <ActionButton
            variant="primary"
            disabled={!vault.supported}
            onClick={() => void vault.unlock(pass)}
          >
            <Unlock className="h-3.5 w-3.5" /> Unlock
          </ActionButton>
        )}
        <span className="rounded border border-border px-2.5 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          state: <span className={unlocked ? "text-accent" : "text-primary"}>{vault.status}</span>
        </span>
      </div>

      {vault.error && <p className="mt-2 text-[11px] text-primary">{vault.error}</p>}

      <div className="mt-4 grid gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as VaultEntry["provider"])}
          className="rounded border border-border bg-background/70 px-2 py-2 text-xs outline-none focus:border-accent"
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="label"
          className="rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
        />
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="sk-…"
          className="rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
        />
        <ActionButton
          variant="accent"
          disabled={!unlocked}
          onClick={() => {
            void vault.addEntry({ provider, label }, secret).then(() => {
              setSecret("");
              setLabel("");
            });
          }}
        >
          Seal
        </ActionButton>
      </div>

      <ul className="mt-4 space-y-2">
        {vault.entries.length === 0 && (
          <li className="rounded border border-border/60 p-3 text-center text-[11px] text-muted-foreground">
            Vault empty — no ciphertext on disk
          </li>
        )}
        {vault.entries.map((e) => {
          const plain = vault.revealed[e.id];
          return (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 bg-background/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  {e.provider} · {e.label}
                </p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {plain ? maskSecret(plain) : `${e.cipher.slice(0, 34)}…`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!unlocked}
                  onClick={() => (plain ? vault.hide(e.id) : void vault.reveal(e.id))}
                  className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
                  aria-label={plain ? "Hide key" : "Reveal key"}
                >
                  {plain ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => vault.removeEntry(e.id)}
                  className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Delete key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {vault.entries.length > 0 && (
        <div className="mt-3">
          <ActionButton variant="ghost" onClick={vault.purge}>
            Purge Vault
          </ActionButton>
        </div>
      )}
    </Panel>
  );
}