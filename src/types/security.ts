export interface VaultEntry {
  id: string;
  provider: "groq" | "openrouter" | "gemini" | "custom";
  label: string;
  cipher: string; // base64 iv + ciphertext
  createdAt: number;
}

export type VaultStatus = "locked" | "unlocked" | "empty";

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "gas";

export interface AuditFinding {
  id: string;
  title: string;
  severity: AuditSeverity;
  line: number;
  detail: string;
  remediation: string;
}

export type WafVector = "sqli" | "xss" | "prompt-injection" | "path-traversal" | "command" | "clean";

export interface WafVerdict {
  blocked: boolean;
  score: number;
  vectors: { vector: WafVector; pattern: string; match: string }[];
  sanitized: string;
}

export interface WafLogEntry {
  id: string;
  at: number;
  input: string;
  verdict: WafVerdict;
}

export interface CostSample {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  usd: number;
  pkr: number;
  at: number;
}

export interface PortResult {
  port: number;
  service: string;
  state: "open" | "closed" | "filtered";
}