// AES-256-GCM vault primitives built on WebCrypto. The passphrase never leaves
// memory; only iv+ciphertext blobs are persisted to localStorage.

const SALT = "devil-vault-v1";
const ITERATIONS = 210_000;

export const VAULT_STORAGE_KEY = "devil.vault.v1";

function subtle(): SubtleCrypto | null {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) return null;
  return globalThis.crypto.subtle;
}

export function cryptoSupported(): boolean {
  return subtle() !== null;
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(value: string): Uint8Array {
  const raw = atob(value);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const s = subtle();
  if (!s) throw new Error("WebCrypto unavailable on this device");
  const material = await s.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return s.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(key: CryptoKey, plain: string): Promise<string> {
  const s = subtle();
  if (!s) throw new Error("WebCrypto unavailable on this device");
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const buf = await s.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  const cipher = new Uint8Array(buf);
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return toBase64(packed);
}

export async function decryptSecret(key: CryptoKey, packedB64: string): Promise<string> {
  const s = subtle();
  if (!s) throw new Error("WebCrypto unavailable on this device");
  const packed = fromBase64(packedB64);
  const iv = packed.slice(0, 12);
  const cipher = packed.slice(12);
  const buf = await s.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(buf);
}

export function maskSecret(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 4)}${"•".repeat(Math.min(18, value.length - 8))}${value.slice(-4)}`;
}