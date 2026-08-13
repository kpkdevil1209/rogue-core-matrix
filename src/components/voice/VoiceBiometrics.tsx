import { Fingerprint, Lock, Unlock, Waves } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import type { BiometricProfile } from "@/types/voice";

export function VoiceBiometrics({
  profile,
  onEnroll,
  onReset,
  hotwordArmed,
  onToggleHotword,
  hotwordHits,
  sttSupported,
}: {
  profile: BiometricProfile;
  onEnroll: () => void;
  onReset: () => void;
  hotwordArmed: boolean;
  onToggleHotword: () => void;
  hotwordHits: number;
  sttSupported: boolean;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel icon={Fingerprint} title="Voice Biometric Fingerprint Lock" tag="F36">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${
              profile.unlocked
                ? "border-accent bg-accent/10 ring-glow"
                : "border-primary bg-primary/10"
            }`}
          >
            {profile.unlocked ? (
              <Unlock className="h-7 w-7 text-accent" />
            ) : (
              <Lock className="h-7 w-7 text-primary" />
            )}
          </div>
          <dl className="grid flex-1 grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Match</dt>
              <dd className="tabular-nums">{profile.matchScore.toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Pitch</dt>
              <dd className="tabular-nums">{profile.pitchHz} Hz</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Timbre</dt>
              <dd className="tabular-nums">{profile.timbre.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">State</dt>
              <dd>{profile.enrolled ? (profile.unlocked ? "UNLOCKED" : "REJECTED") : "NO PRINT"}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <ActionButton onClick={onEnroll}>Enroll Print</ActionButton>
          <ActionButton variant="ghost" onClick={onReset}>
            Shred Print
          </ActionButton>
        </div>
      </Panel>

      <Panel icon={Waves} title="“Hey Devil” Hotword Engine" tag="F38">
        <div className="flex items-center justify-between gap-3 rounded border border-border/60 bg-background/60 px-3 py-2.5">
          <span className="text-xs">
            Wake phrase
            <span className="ml-2 font-mono text-accent">“hey devil”</span>
          </span>
          <button
            onClick={onToggleHotword}
            className={`rounded border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
              hotwordArmed
                ? "border-accent bg-accent/15 text-accent ring-glow"
                : "border-border text-muted-foreground"
            }`}
          >
            {hotwordArmed ? "Armed" : "Disarmed"}
          </button>
        </div>
        <ul className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
          <li>Hotword triggers: <span className="tabular-nums text-foreground">{hotwordHits}</span></li>
          <li>
            Background stream listener:{" "}
            <span className={hotwordArmed ? "text-accent" : "text-muted-foreground"}>
              {hotwordArmed ? "continuous restart loop active" : "suspended"}
            </span>
          </li>
          <li>
            Recognition engine:{" "}
            <span className={sttSupported ? "text-accent" : "text-primary"}>
              {sttSupported ? "native SpeechRecognition" : "unsupported — manual dictation fallback"}
            </span>
          </li>
        </ul>
      </Panel>
    </div>
  );
}