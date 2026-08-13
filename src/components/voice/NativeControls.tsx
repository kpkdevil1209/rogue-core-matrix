import { useState } from "react";
import { Code2, Database, Smartphone, Sliders } from "lucide-react";
import { ActionButton, CodeBlock, Field, Panel } from "@/components/autocoder/Panel";
import { speechToCode } from "@/lib/voiceIntents";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label} <span className="tabular-nums text-foreground">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--primary))]"
      />
    </label>
  );
}

export function NativeControls({
  rate,
  pitch,
  volume,
  setRate,
  setPitch,
  setVolume,
  onSpeak,
  onHaptic,
  haptics,
  cache,
}: {
  rate: number;
  pitch: number;
  volume: number;
  setRate: (v: number) => void;
  setPitch: (v: number) => void;
  setVolume: (v: number) => void;
  onSpeak: (t: string) => void;
  onHaptic: (p: number | number[]) => void;
  haptics: boolean;
  cache: string[];
}) {
  const [dictation, setDictation] = useState(
    "create component ThreatCard then state alerts then log breach detected",
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel icon={Sliders} title="Speech Speed / Pitch Controls" tag="F153">
        <div className="space-y-3">
          <Slider label="rate" value={rate} min={0.5} max={2} step={0.05} onChange={setRate} />
          <Slider label="pitch" value={pitch} min={0} max={2} step={0.05} onChange={setPitch} />
          <Slider label="volume" value={volume} min={0} max={1} step={0.05} onChange={setVolume} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton variant="accent" onClick={() => onSpeak("Voice synthesis calibrated. DEVIL is listening.")}>
            Test Voice
          </ActionButton>
          <ActionButton variant="ghost" onClick={() => { setRate(1); setPitch(0.8); setVolume(1); }}>
            Reset
          </ActionButton>
        </div>
      </Panel>

      <Panel icon={Smartphone} title="Haptic Feedback Dispatcher" tag="F155">
        <p className="mb-3 text-[11px] text-muted-foreground">
          navigator.vibrate {haptics ? "available — patterns fire on device" : "unavailable — patterns simulated"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => onHaptic(20)}>Tap Pulse</ActionButton>
          <ActionButton onClick={() => onHaptic([30, 40, 30])}>Confirm</ActionButton>
          <ActionButton onClick={() => onHaptic([60, 30, 60, 30, 120])}>Alert Burst</ActionButton>
          <ActionButton variant="ghost" onClick={() => onHaptic(0)}>
            Kill Buzz
          </ActionButton>
        </div>
      </Panel>

      <Panel icon={Database} title="Offline Audio Cache" tag="F156">
        {cache.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Cache empty — synthesized phrases are stored for offline replay.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {cache.map((c, i) => (
              <li key={`${i}-${c.slice(0, 8)}`}>
                <button
                  onClick={() => onSpeak(c)}
                  className="w-full truncate rounded border border-border/60 bg-background/60 px-3 py-2 text-left text-[11px] transition-colors hover:border-accent hover:text-accent"
                >
                  ▶ {c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel icon={Code2} title="Speech-to-Code Interpreter" tag="F157">
        <Field label="Dictated instruction" value={dictation} onChange={setDictation} rows={3} />
        <div className="mt-3">
          <CodeBlock>{speechToCode(dictation)}</CodeBlock>
        </div>
      </Panel>
    </div>
  );
}