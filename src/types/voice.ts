export type VoiceStatus = "idle" | "listening" | "speaking" | "locked";

export interface Utterance {
  id: string;
  role: "user" | "devil";
  text: string;
  at: number;
}

export interface VoiceIntent {
  id: string;
  label: string;
  keywords: string[];
  scheme: string;
  hint: string;
}

export interface DeepLink {
  id: string;
  label: string;
  href: string;
  intent: string;
  at: number;
}

export interface BiometricProfile {
  enrolled: boolean;
  matchScore: number;
  pitchHz: number;
  timbre: number;
  unlocked: boolean;
}