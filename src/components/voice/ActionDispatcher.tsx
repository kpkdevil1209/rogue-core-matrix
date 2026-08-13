import { useState } from "react";
import { ExternalLink, Radio, Zap } from "lucide-react";
import { ActionButton, Field, Panel } from "@/components/autocoder/Panel";
import { VOICE_INTENTS, buildDeepLink } from "@/lib/voiceIntents";
import type { DeepLink } from "@/types/voice";

export function ActionDispatcher({
  links,
  onSimulate,
  onHaptic,
}: {
  links: DeepLink[];
  onSimulate: (phrase: string) => void;
  onHaptic: (p: number | number[]) => void;
}) {
  const [target, setTarget] = useState("+14155550137");

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel icon={Radio} title="Voice Command Dispatcher" tag="F27">
        <Field label="Native target (number / place / address)" value={target} onChange={setTarget} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VOICE_INTENTS.map((intent) => (
            <ActionButton
              key={intent.id}
              variant="ghost"
              onClick={() => onSimulate(`${intent.keywords[0]} ${target}`)}
            >
              <Zap className="h-3.5 w-3.5" /> {intent.label}
            </ActionButton>
          ))}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Spoken intent detection → deep-link forge → tap to execute
        </p>
      </Panel>

      <Panel icon={ExternalLink} title="Deep-Link Native Triggers" tag="F28">
        {links.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No dispatch yet — speak or fire an intent above.
          </p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded border border-border/60 bg-background/60 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">{l.label}</span>
                  <span className="block truncate font-mono text-[10px] text-muted-foreground">
                    {l.href}
                  </span>
                </span>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onHaptic([10, 20, 10])}
                  className="shrink-0 rounded border border-primary bg-primary/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary ring-glow transition-colors hover:bg-primary/30"
                >
                  Execute
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          schemes: tel: · sms: · whatsapp:// · intent:// · geo: · mailto:
        </p>
      </Panel>
    </div>
  );
}