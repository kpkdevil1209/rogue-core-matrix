import { useCallback, useEffect, useRef, useState } from "react";
import type { BiometricProfile, DeepLink, Utterance, VoiceStatus } from "@/types/voice";
import { buildDeepLink, detectIntent, extractTarget } from "@/lib/voiceIntents";

const BARS = 64;
const HOTWORD = "hey devil";

type RecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  const ctor = w["SpeechRecognition"] ?? w["webkitSpeechRecognition"];
  return typeof ctor === "function" ? (ctor as new () => RecognitionLike) : null;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useVoiceEngine() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [supported, setSupported] = useState({ stt: false, tts: false, haptics: false, mic: false });
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [spectrum, setSpectrum] = useState<number[]>(() => new Array(BARS).fill(4));
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(0.8);
  const [volume, setVolume] = useState(1);
  const [hotwordArmed, setHotwordArmed] = useState(true);
  const [hotwordHits, setHotwordHits] = useState(0);
  const [fullDuplex, setFullDuplex] = useState(true);
  const [links, setLinks] = useState<DeepLink[]>([]);
  const [cache, setCache] = useState<string[]>([]);
  const [biometric, setBiometric] = useState<BiometricProfile>({
    enrolled: false,
    matchScore: 0,
    pitchHz: 118,
    timbre: 0.42,
    unlocked: false,
  });

  const recognition = useRef<RecognitionLike | null>(null);
  const listening = useRef(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const nav = navigator as unknown as Record<string, unknown>;
    setSupported({
      stt: !!getRecognitionCtor(),
      tts: typeof window.speechSynthesis !== "undefined",
      haptics: typeof nav["vibrate"] === "function",
      mic: !!navigator.mediaDevices?.getUserMedia,
    });
  }, []);

  const haptic = useCallback((pattern: number | number[]) => {
    const nav = navigator as unknown as { vibrate?: (p: number | number[]) => boolean };
    nav.vibrate?.(pattern);
  }, []);

  const pushUtterance = useCallback((role: Utterance["role"], text: string) => {
    setUtterances((prev) => [{ id: uid(), role, text, at: Date.now() }, ...prev].slice(0, 40));
  }, []);

  const speak = useCallback(
    (text: string) => {
      setCache((prev) => [text, ...prev.filter((t) => t !== text)].slice(0, 12));
      pushUtterance("devil", text);
      if (typeof window.speechSynthesis === "undefined") return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onstart = () => setStatus("speaking");
      u.onend = () => setStatus(listening.current ? "listening" : "idle");
      window.speechSynthesis.speak(u);
    },
    [pitch, pushUtterance, rate, volume],
  );

  const dispatchIntent = useCallback(
    (text: string) => {
      const intent = detectIntent(text);
      if (!intent) return null;
      const href = buildDeepLink(intent, extractTarget(text));
      const link: DeepLink = { id: uid(), label: intent.label, href, intent: intent.id, at: Date.now() };
      setLinks((prev) => [link, ...prev].slice(0, 12));
      haptic([18, 40, 18]);
      return link;
    },
    [haptic],
  );

  const handleFinal = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      const lower = clean.toLowerCase();
      if (hotwordArmed && lower.includes(HOTWORD)) {
        setHotwordHits((n) => n + 1);
        haptic(30);
      }
      setTranscript(clean);
      pushUtterance("user", clean);
      setBiometric((p) => ({
        ...p,
        matchScore: p.enrolled ? Math.min(99.4, 82 + (clean.length % 17)) : 0,
        unlocked: p.enrolled ? 82 + (clean.length % 17) > 86 : false,
      }));
      const link = dispatchIntent(clean);
      if (fullDuplex) {
        speak(
          link
            ? `Dispatching ${link.label}. Tap to execute the native handoff.`
            : `Command received. ${clean.slice(0, 90)}`,
        );
      }
    },
    [dispatchIntent, fullDuplex, haptic, hotwordArmed, pushUtterance, speak],
  );

  const startSpectrum = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      audioCtx.current = ctx;
      const source = ctx.createMediaStreamSource(media);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      source.connect(node);
      analyser.current = node;
    } catch {
      analyser.current = null;
    }
  }, []);

  const stopSpectrum = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    analyser.current = null;
    audioCtx.current?.close().catch(() => {});
    audioCtx.current = null;
  }, []);

  // Spectrum animation: real mic data when available, synthetic waveform otherwise.
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t += 0.08;
      const node = analyser.current;
      if (node) {
        const data = new Uint8Array(node.frequencyBinCount);
        node.getByteFrequencyData(data);
        const step = Math.max(1, Math.floor(data.length / BARS));
        setSpectrum(
          Array.from({ length: BARS }, (_, i) => Math.max(4, ((data[i * step] ?? 0) / 255) * 100)),
        );
      } else {
        const gain = status === "idle" ? 0.18 : status === "speaking" ? 0.9 : 0.7;
        setSpectrum(
          Array.from({ length: BARS }, (_, i) => {
            const wave =
              Math.sin(t + i * 0.35) * 0.5 + Math.sin(t * 1.7 + i * 0.11) * 0.35 + 0.55;
            return Math.max(4, Math.min(100, wave * 100 * gain));
          }),
        );
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [status]);

  const stopListening = useCallback(() => {
    listening.current = false;
    recognition.current?.stop();
    recognition.current = null;
    stopSpectrum();
    setInterim("");
    setStatus("idle");
  }, [stopSpectrum]);

  const startListening = useCallback(async () => {
    listening.current = true;
    setStatus("listening");
    haptic(12);
    await startSpectrum();
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      };
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        if (!res) continue;
        if (res.isFinal) handleFinal(res[0].transcript);
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = () => setInterim("");
    rec.onend = () => {
      if (listening.current) {
        try {
          rec.start();
        } catch {
          /* restart race */
        }
      }
    };
    recognition.current = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }, [handleFinal, haptic, startSpectrum]);

  useEffect(() => stopListening, [stopListening]);

  const enroll = useCallback(() => {
    setBiometric({
      enrolled: true,
      matchScore: 96.8,
      pitchHz: 112 + Math.round(Math.random() * 24),
      timbre: 0.38 + Math.random() * 0.3,
      unlocked: true,
    });
    haptic([20, 30, 60]);
  }, [haptic]);

  const resetBiometric = useCallback(() => {
    setBiometric({ enrolled: false, matchScore: 0, pitchHz: 118, timbre: 0.42, unlocked: false });
  }, []);

  return {
    status,
    supported,
    spectrum,
    transcript,
    interim,
    utterances,
    listening: listening.current || status === "listening",
    rate,
    pitch,
    volume,
    setRate,
    setPitch,
    setVolume,
    hotwordArmed,
    setHotwordArmed,
    hotwordHits,
    fullDuplex,
    setFullDuplex,
    links,
    cache,
    biometric,
    enroll,
    resetBiometric,
    startListening,
    stopListening,
    speak,
    haptic,
    handleFinal,
  };
}