import { useCallback, useEffect, useState } from "react";
import {
  VAULT_STORAGE_KEY,
  cryptoSupported,
  decryptSecret,
  deriveKey,
  encryptSecret,
} from "@/lib/vaultCrypto";
import type { VaultEntry, VaultStatus } from "@/types/security";

export function useVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [status, setStatus] = useState<VaultStatus>("locked");
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(cryptoSupported());
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as VaultEntry[]) : [];
      setEntries(parsed);
      setStatus(parsed.length ? "locked" : "empty");
    } catch {
      setEntries([]);
      setStatus("empty");
    }
  }, []);

  const persist = useCallback((next: VaultEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError("LocalStorage write blocked by this browser");
    }
  }, []);

  const unlock = useCallback(
    async (passphrase: string) => {
      setError(null);
      if (passphrase.length < 6) {
        setError("Passphrase must be at least 6 characters");
        return false;
      }
      try {
        const k = await deriveKey(passphrase);
        // Validate against the first stored blob if one exists.
        const probe = entries[0];
        if (probe) await decryptSecret(k, probe.cipher);
        setKey(k);
        setStatus("unlocked");
        return true;
      } catch {
        setError("Decryption failed — wrong passphrase for this vault");
        return false;
      }
    },
    [entries],
  );

  const lock = useCallback(() => {
    setKey(null);
    setRevealed({});
    setStatus(entries.length ? "locked" : "empty");
  }, [entries.length]);

  const addEntry = useCallback(
    async (entry: Pick<VaultEntry, "provider" | "label">, secret: string) => {
      setError(null);
      if (!key) {
        setError("Unlock the vault before writing keys");
        return;
      }
      if (!secret.trim()) {
        setError("Key value is empty");
        return;
      }
      try {
        const cipher = await encryptSecret(key, secret.trim());
        persist([
          ...entries,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            provider: entry.provider,
            label: entry.label || entry.provider.toUpperCase(),
            cipher,
            createdAt: Date.now(),
          },
        ]);
      } catch {
        setError("Encryption failed on this device");
      }
    },
    [entries, key, persist],
  );

  const reveal = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry || !key) return;
      try {
        const plain = await decryptSecret(key, entry.cipher);
        setRevealed((r) => ({ ...r, [id]: plain }));
      } catch {
        setError("Could not decrypt that entry");
      }
    },
    [entries, key],
  );

  const hide = useCallback((id: string) => {
    setRevealed((r) => {
      const next = { ...r };
      delete next[id];
      return next;
    });
  }, []);

  const removeEntry = useCallback(
    (id: string) => {
      hide(id);
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, hide, persist],
  );

  const purge = useCallback(() => {
    setRevealed({});
    persist([]);
    setKey(null);
    setStatus("empty");
  }, [persist]);

  return {
    entries,
    status,
    error,
    revealed,
    supported,
    unlock,
    lock,
    addEntry,
    reveal,
    hide,
    removeEntry,
    purge,
  };
}