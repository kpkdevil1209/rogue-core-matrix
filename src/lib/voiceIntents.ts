import type { VoiceIntent } from "@/types/voice";

export const VOICE_INTENTS: VoiceIntent[] = [
  {
    id: "call",
    label: "Place Call",
    keywords: ["call", "dial", "phone"],
    scheme: "tel:",
    hint: "tel: handoff",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Relay",
    keywords: ["whatsapp", "whats app", "message"],
    scheme: "https://wa.me/",
    hint: "whatsapp://",
  },
  {
    id: "sms",
    label: "Encrypted SMS",
    keywords: ["sms", "text", "send text"],
    scheme: "sms:",
    hint: "sms: bridge",
  },
  {
    id: "camera",
    label: "Open Camera",
    keywords: ["camera", "photo", "capture", "scan"],
    scheme: "intent://camera",
    hint: "intent://",
  },
  {
    id: "maps",
    label: "Maps Vector",
    keywords: ["maps", "map", "navigate", "directions"],
    scheme: "https://maps.google.com/?q=",
    hint: "geo:",
  },
  {
    id: "mail",
    label: "Mail Drop",
    keywords: ["mail", "email"],
    scheme: "mailto:",
    hint: "mailto:",
  },
];

/** Extracts a phone number or free-form target from a spoken transcript. */
export function extractTarget(transcript: string): string {
  const digits = transcript.replace(/[^\d+]/g, "");
  if (digits.length >= 7) return digits;
  const after = transcript.match(
    /(?:call|dial|whatsapp|text|sms|navigate to|maps to|open|email|mail)\s+(.+)$/i,
  );
  return after?.[1]?.trim() ?? "";
}

export function detectIntent(transcript: string): VoiceIntent | null {
  const lower = transcript.toLowerCase();
  return (
    VOICE_INTENTS.find((intent) => intent.keywords.some((k) => lower.includes(k))) ?? null
  );
}

export function buildDeepLink(intent: VoiceIntent, target: string): string {
  const clean = target.trim();
  switch (intent.id) {
    case "call":
      return `tel:${clean.replace(/[^\d+]/g, "") || "+10000000000"}`;
    case "sms":
      return `sms:${clean.replace(/[^\d+]/g, "") || "+10000000000"}`;
    case "whatsapp":
      return `https://wa.me/${clean.replace(/[^\d]/g, "") || "10000000000"}`;
    case "camera":
      return "intent://camera#Intent;scheme=devil;package=com.android.camera;end";
    case "maps":
      return `https://maps.google.com/?q=${encodeURIComponent(clean || "current location")}`;
    case "mail":
      return `mailto:${clean || "root@devil.os"}`;
    default:
      return intent.scheme + encodeURIComponent(clean);
  }
}

const CODE_RULES: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/create (?:a )?(?:react )?component (?:called |named )?(\w+)/i, (m) => `export function ${m[1]?.replace(/^./, (c) => c.toUpperCase())}() {\n  return <div className="hud-panel p-4">${m[1]}</div>;\n}`],
  [/create (?:a )?function (?:called |named )?(\w+)/i, (m) => `function ${m[1]}() {\n  // TODO: implement\n}`],
  [/(?:loop|for loop) (?:over |through )?(\w+)/i, (m) => `for (const item of ${m[1]}) {\n  console.log(item);\n}`],
  [/log (.+)/i, (m) => `console.log("${m[1]?.trim()}");`],
  [/fetch (.+)/i, (m) => `const res = await fetch("${m[1]?.trim()}");\nconst data = await res.json();`],
  [/state (?:called |named )?(\w+)/i, (m) => `const [${m[1]}, set${m[1]?.replace(/^./, (c) => c.toUpperCase())}] = useState(null);`],
];

/** Speech-to-Code interpreter: converts spoken phrases into source lines. */
export function speechToCode(transcript: string): string {
  const lines = transcript
    .split(/\bthen\b|[.;]/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const line of lines) {
    let matched = false;
    for (const [re, build] of CODE_RULES) {
      const m = line.match(re);
      if (m) {
        out.push(build(m));
        matched = true;
        break;
      }
    }
    if (!matched) out.push(`// ${line}`);
  }
  return out.join("\n\n") || "// awaiting dictation";
}