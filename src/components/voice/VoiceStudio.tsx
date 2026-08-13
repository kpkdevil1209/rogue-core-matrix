import { useState } from "react";
import { Download, Mic, MicOff, Radio, Send, Volume2 } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { SpectrumEqualizer } from "./SpectrumEqualizer";
import { ActionDispatcher } from "./ActionDispatcher";
import { VoiceBiometrics } from "./VoiceBiometrics";
import { NativeControls } from "./NativeControls";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";

export function VoiceStudio() {
  const v = useVoiceEngine();
  const [manual, setManual] = useState("");
  const [installed, setInstalled] = useState(false);

  return (
    <div className="space-y-4">
      <div className="hud-panel rounded-lg p-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent text-glow-neon">
          CAT 03 / 16 · Features 26–38 · 153–158
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-glow-crimson">
          <Radio className="h-6 w-6 text-primary" />
          Voice Mode & Mobile Action Bridge
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Full-duplex speech channel with 64-bar spectrum telemetry, spoken intent dispatch to
          native device schemes, voice biometric lock and “Hey Devil” hotword watch.
        </p>
      </div>

      <Panel icon={Mic} title="Full-Duplex Voice Channel" tag="F26">
        <SpectrumEqualizer bars={v.spectrum} active={v.status !== "idle"} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ActionButton
            variant={v.listening ? "ghost" : "primary"}
            onClick={() => (v.listening ? v.stopListening() : void v.startListening())}
          >
            {v.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {v.listening ? "Halt Listener" : "Engage Listener"}
          </ActionButton>
          <ActionButton
            variant="accent"
            onClick={() => v.setFullDuplex(!v.fullDuplex)}
          >
            <Volume2 className="h-3.5 w-3.5" /> Duplex {v.fullDuplex ? "ON" : "OFF"}
          </ActionButton>
          <span className="rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            status: <span className="text-accent">{v.status}</span>
          </span>
          {!v.supported.stt && (
            <span className="rounded border border-primary/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
              STT fallback: type below
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && manual.trim()) {
                v.handleFinal(manual);
                setManual("");
              }
            }}
            placeholder="Speak or type a command — “hey devil, call +14155550137”"
            className="flex-1 rounded border border-border bg-background/70 px-3 py-2 font-mono text-xs outline-none focus:border-accent"
          />
          <ActionButton
            onClick={() => {
              if (!manual.trim()) return;
              v.handleFinal(manual);
              setManual("");
            }}
          >
            <Send className="h-3.5 w-3.5" /> Dispatch
          </ActionButton>
        </div>

        {v.interim && (
          <p className="mt-2 font-mono text-[11px] text-accent">…{v.interim}</p>
        )}

        <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
          {v.utterances.map((u) => (
            <li
              key={u.id}
              className={`rounded border px-3 py-2 text-[11px] ${
                u.role === "user"
                  ? "border-accent/40 bg-accent/5"
                  : "border-primary/40 bg-primary/5"
              }`}
            >
              <span className="mr-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {u.role === "user" ? "operator" : "devil"}
              </span>
              {u.text}
            </li>
          ))}
        </ul>
      </Panel>

      <ActionDispatcher links={v.links} onSimulate={v.handleFinal} onHaptic={v.haptic} />

      <VoiceBiometrics
        profile={v.biometric}
        onEnroll={v.enroll}
        onReset={v.resetBiometric}
        hotwordArmed={v.hotwordArmed}
        onToggleHotword={() => v.setHotwordArmed(!v.hotwordArmed)}
        hotwordHits={v.hotwordHits}
        sttSupported={v.supported.stt}
      />

      <NativeControls
        rate={v.rate}
        pitch={v.pitch}
        volume={v.volume}
        setRate={v.setRate}
        setPitch={v.setPitch}
        setVolume={v.setVolume}
        onSpeak={v.speak}
        onHaptic={v.haptic}
        haptics={v.supported.haptics}
        cache={v.cache}
      />

      <Panel icon={Download} title="PWA Install Bridge — Add to Home Screen" tag="F29">
        <p className="text-[11px] text-muted-foreground">
          Web app manifest is wired with the DEVIL mark, standalone display and pitch-black theme,
          so mobile browsers can install the OS to the home screen.
        </p>
        <div className="mt-3">
          <ActionButton
            variant="accent"
            onClick={() => {
              setInstalled(true);
              v.haptic([20, 30, 60]);
              v.speak("Home screen install manifest served. Use your browser install prompt.");
            }}
          >
            {installed ? "Manifest Served" : "Prime Install"}
          </ActionButton>
        </div>
      </Panel>
    </div>
  );
}