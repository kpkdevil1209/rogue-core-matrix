import type { PortResult } from "@/types/security";

/* ---------- Subnet / CIDR ---------- */

export interface SubnetInfo {
  valid: boolean;
  error?: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  mask: string;
  wildcard: string;
  hosts: number;
  prefix: number;
  class: string;
  private: boolean;
}

function toInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let v = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    v = (v << 8) | n;
  }
  return v >>> 0;
}

function toIp(v: number): string {
  return [24, 16, 8, 0].map((s) => (v >>> s) & 255).join(".");
}

export function calcSubnet(cidr: string): SubnetInfo {
  const blank: SubnetInfo = {
    valid: false,
    network: "—",
    broadcast: "—",
    firstHost: "—",
    lastHost: "—",
    mask: "—",
    wildcard: "—",
    hosts: 0,
    prefix: 0,
    class: "—",
    private: false,
  };
  const [ip, prefixRaw] = cidr.trim().split("/");
  const base = toInt(ip ?? "");
  const prefix = Number(prefixRaw ?? "");
  if (base === null) return { ...blank, error: "Invalid IPv4 address" };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32)
    return { ...blank, error: "Prefix must be /0 – /32" };

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (base & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);
  const hosts = total > 2 ? total - 2 : total;
  const firstOctet = (network >>> 24) & 255;
  const klass =
    firstOctet < 128 ? "A" : firstOctet < 192 ? "B" : firstOctet < 224 ? "C" : firstOctet < 240 ? "D" : "E";
  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 && ((network >>> 16) & 255) >= 16 && ((network >>> 16) & 255) <= 31) ||
    (firstOctet === 192 && ((network >>> 16) & 255) === 168);

  return {
    valid: true,
    network: toIp(network),
    broadcast: toIp(broadcast),
    firstHost: toIp(total > 2 ? network + 1 : network),
    lastHost: toIp(total > 2 ? broadcast - 1 : broadcast),
    mask: toIp(mask),
    wildcard: toIp(~mask >>> 0),
    hosts,
    prefix,
    class: klass,
    private: isPrivate,
  };
}

/* ---------- Hashing ---------- */

export async function sha(algo: "SHA-1" | "SHA-256" | "SHA-512", input: string): Promise<string> {
  const s = globalThis.crypto?.subtle;
  if (!s) return "unsupported on this device";
  const buf = await s.digest(algo, new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pure-JS MD5 (WebCrypto does not expose it). RFC 1321.
export function md5(input: string): string {
  const rl = (n: number, c: number) => (n << c) | (n >>> (32 - c));
  const add = (a: number, b: number) => (((a + b) & 0xffffffff) >>> 0);
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) * 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bitLen / 2 ** 32), true);

  const K = new Int32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) | 0;
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
    20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
    10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) M.push(dv.getUint32(chunk + i * 4, true));
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = add(add(F, A), add(K[i]! >>> 0, M[g]!));
      A = D; D = C; C = B;
      B = add(B, rl(F >>> 0, S[i]!));
    }
    a0 = add(a0, A); b0 = add(b0, B); c0 = add(c0, C); d0 = add(d0, D);
  }

  const hex = (n: number) =>
    [0, 8, 16, 24].map((s) => (((n >>> s) & 255).toString(16).padStart(2, "0"))).join("");
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

/* ---------- Encoders ---------- */

export function encodeBase64(input: string): string {
  try {
    const bytes = new TextEncoder().encode(input);
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  } catch {
    return "encode error";
  }
}

export function decodeBase64(input: string): string {
  try {
    const raw = atob(input.trim());
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return "invalid base64";
  }
}

export function encodeHex(input: string): string {
  return [...new TextEncoder().encode(input)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

export function decodeHex(input: string): string {
  const clean = input.replace(/0x|[^0-9a-f]/gi, "");
  if (!clean.length || clean.length % 2) return "invalid hex";
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return new TextDecoder().decode(bytes);
}

/* ---------- JWT ---------- */

export interface JwtInspection {
  valid: boolean;
  error?: string;
  header: string;
  payload: string;
  signature: string;
  alg: string;
  expired: boolean;
  expiresAt?: string;
  issuedAt?: string;
  warnings: string[];
}

function b64url(segment: string): string {
  return decodeBase64(segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "="));
}

export function inspectJwt(token: string): JwtInspection {
  const empty: JwtInspection = {
    valid: false,
    header: "",
    payload: "",
    signature: "",
    alg: "—",
    expired: false,
    warnings: [],
  };
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ...empty, error: "Expected 3 dot-separated segments" };
  try {
    const header = JSON.parse(b64url(parts[0]!)) as Record<string, unknown>;
    const payload = JSON.parse(b64url(parts[1]!)) as Record<string, unknown>;
    const warnings: string[] = [];
    const alg = String(header["alg"] ?? "none");
    if (/^none$/i.test(alg)) warnings.push("alg=none — signature verification is disabled");
    if (/^HS/i.test(alg)) warnings.push("HMAC alg — key confusion risk if RS keys are also accepted");
    const exp = typeof payload["exp"] === "number" ? (payload["exp"] as number) : undefined;
    const iat = typeof payload["iat"] === "number" ? (payload["iat"] as number) : undefined;
    const expired = exp !== undefined && exp * 1000 < Date.now();
    if (expired) warnings.push("Token is expired");
    if (exp === undefined) warnings.push("No exp claim — token never expires");
    return {
      valid: true,
      header: JSON.stringify(header, null, 2),
      payload: JSON.stringify(payload, null, 2),
      signature: parts[2]!,
      alg,
      expired,
      ...(exp !== undefined ? { expiresAt: new Date(exp * 1000).toISOString() } : {}),
      ...(iat !== undefined ? { issuedAt: new Date(iat * 1000).toISOString() } : {}),
      warnings,
    };
  } catch {
    return { ...empty, error: "Segments are not valid base64url JSON" };
  }
}

/* ---------- Port scanner simulation ---------- */

const SERVICES: Record<number, string> = {
  21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns", 80: "http", 110: "pop3",
  143: "imap", 443: "https", 445: "smb", 587: "smtp-tls", 993: "imaps", 1433: "mssql",
  3000: "node-dev", 3306: "mysql", 3389: "rdp", 5432: "postgres", 5900: "vnc",
  6379: "redis", 8080: "http-alt", 8443: "https-alt", 9200: "elasticsearch", 27017: "mongodb",
};

export const COMMON_PORTS = Object.keys(SERVICES).map(Number);

// Deterministic pseudo-random so a given host always yields the same map.
function hashSeed(host: string, port: number): number {
  let h = 2166136261;
  for (const ch of `${host}:${port}`) h = (h ^ ch.charCodeAt(0)) * 16777619;
  return ((h >>> 0) % 1000) / 1000;
}

export function scanPort(host: string, port: number): PortResult {
  const r = hashSeed(host, port);
  const state: PortResult["state"] = r > 0.78 ? "open" : r > 0.62 ? "filtered" : "closed";
  return { port, service: SERVICES[port] ?? "unknown", state };
}

/* ---------- Steganography ---------- */

export interface StegoResult {
  found: boolean;
  message: string;
  bitsScanned: number;
  entropy: number;
}

/** Extracts an LSB payload from raw RGBA pixel data (terminated by a NUL byte). */
export function extractLsbPayload(data: Uint8ClampedArray): StegoResult {
  const bits: number[] = [];
  const limit = Math.min(data.length, 4 * 8 * 4096);
  for (let i = 0; i < limit; i += 4) {
    bits.push(data[i]! & 1, data[i + 1]! & 1, data[i + 2]! & 1);
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]!;
    if (b === 0) break;
    bytes.push(b);
    if (bytes.length > 4096) break;
  }
  const ones = bits.reduce((a, b) => a + b, 0);
  const p = bits.length ? ones / bits.length : 0;
  const entropy = p === 0 || p === 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  const printable = bytes.filter((b) => b >= 32 && b < 127).length;
  const found = bytes.length > 3 && printable / bytes.length > 0.85;
  return {
    found,
    message: found ? String.fromCharCode(...bytes) : "No coherent LSB payload detected",
    bitsScanned: bits.length,
    entropy: Number(entropy.toFixed(4)),
  };
}

/** Embeds a message into RGBA pixel LSBs — used to forge a test carrier image. */
export function embedLsbPayload(data: Uint8ClampedArray, message: string): void {
  const bytes = [...new TextEncoder().encode(message), 0];
  const bits: number[] = [];
  for (const b of bytes) for (let j = 7; j >= 0; j--) bits.push((b >> j) & 1);
  let bi = 0;
  for (let i = 0; i < data.length && bi < bits.length; i += 4) {
    for (let c = 0; c < 3 && bi < bits.length; c++) {
      data[i + c] = (data[i + c]! & 0xfe) | bits[bi++]!;
    }
  }
}