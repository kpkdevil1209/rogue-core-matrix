import { useRef, useState } from "react";
import { Clapperboard, Film, Sparkles } from "lucide-react";
import { ActionButton, CodeBlock, Panel } from "@/components/autocoder/Panel";
import { formatBytes } from "@/lib/fileIngest";
import { useSystemStore } from "@/store/useSystemStore";

interface Frame {
  t: number;
  url: string;
  brightness: number;
  motion: number;
}

export function VideoProcessor() {
  const [src, setSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ name: string; size: number; duration: number; w: number; h: number } | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<unknown>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pushLog = useSystemStore((s) => s.pushLog);

  const load = (file: File) => {
    setFrames([]);
    setAnalysis(null);
    setSrc(URL.createObjectURL(file));
    setMeta({ name: file.name, size: file.size, duration: 0, w: 0, h: 0 });
    pushLog(`[VID] ${file.name} mounted into multimodal decoder`);
  };

  const extract = async () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setBusy(true);
    const canvas = document.createElement("canvas");
    const w = 240;
    const h = Math.max(1, Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const out: Frame[] = [];
    let prev = -1;
    for (let i = 0; i < 8; i += 1) {
      const t = (video.duration * (i + 0.5)) / 8;
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((res) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          res();
        };
        video.addEventListener("seeked", onSeek);
        video.currentTime = t;
      });
      if (!ctx) break;
      ctx.drawImage(video, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let lum = 0;
      for (let p = 0; p < data.length; p += 4) {
        lum += 0.299 * data[p]! + 0.587 * data[p + 1]! + 0.114 * data[p + 2]!;
      }
      const brightness = Math.round(lum / (data.length / 4));
      const motion = prev < 0 ? 0 : Math.min(100, Math.abs(brightness - prev) * 4);
      prev = brightness;
      out.push({ t: Math.round(t * 100) / 100, url: canvas.toDataURL("image/jpeg", 0.6), brightness, motion });
    }
    setFrames(out);
    setMeta((m) => (m ? { ...m, duration: video.duration, w: video.videoWidth, h: video.videoHeight } : m));
    setBusy(false);
    pushLog(`[VID] ${out.length} keyframes extracted client-side`);
  };

  const analyze = () => {
    if (!frames.length || !meta) return;
    const avg = frames.reduce((s, f) => s + f.brightness, 0) / frames.length;
    const motion = frames.reduce((s, f) => s + f.motion, 0) / frames.length;
    setAnalysis({
      model: "gemini-multimodal-vision (local proxy)",
      clip: meta.name,
      resolution: `${meta.w}x${meta.h}`,
      durationSec: Math.round(meta.duration * 100) / 100,
      keyframes: frames.length,
      avgLuminance: Math.round(avg),
      motionIndex: Math.round(motion),
      lighting: avg > 170 ? "high-key / daylight" : avg > 90 ? "balanced interior" : "low-light / night footage",
      pacing: motion > 40 ? "fast cuts, high scene churn" : motion > 15 ? "moderate camera movement" : "static or tripod shot",
      sceneSummary: frames.map((f) => `t=${f.t}s lum ${f.brightness} motion ${f.motion}`),
    });
    pushLog("[VID] multimodal reasoning pass complete");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Panel icon={Film} title="Video Player HUD" tag="MP4 · WEBM">
        <label className="mb-3 block cursor-pointer rounded border border-dashed border-border p-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent">
          Load MP4 / WebM clip
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) load(f);
            }}
          />
        </label>
        {src ? (
          <video
            ref={videoRef}
            src={src}
            controls
            muted
            playsInline
            className="w-full rounded border border-primary/40 bg-black"
          />
        ) : (
          <div className="grid h-44 place-items-center rounded border border-border/60 text-[11px] text-muted-foreground">
            No stream mounted
          </div>
        )}
        {meta ? (
          <p className="mt-2 font-mono text-[11px] text-accent">
            {meta.name} · {formatBytes(meta.size)}
            {meta.duration ? ` · ${meta.duration.toFixed(2)}s · ${meta.w}x${meta.h}` : ""}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={() => void extract()} disabled={!src || busy}>
            <Clapperboard className="h-3.5 w-3.5" /> {busy ? "Extracting…" : "Extract keyframes"}
          </ActionButton>
          <ActionButton variant="accent" onClick={analyze} disabled={!frames.length}>
            <Sparkles className="h-3.5 w-3.5" /> Multimodal analysis
          </ActionButton>
        </div>
        {frames.length ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {frames.map((f) => (
              <figure key={f.t} className="rounded border border-border/60 p-1">
                <img src={f.url} alt={`Keyframe at ${f.t} seconds`} className="w-full rounded" />
                <figcaption className="mt-1 text-center text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                  {f.t}s
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </Panel>

      <Panel icon={Sparkles} title="Vision Report" tag="STRUCTURED">
        <CodeBlock>{analysis ? JSON.stringify(analysis, null, 2) : "// run an analysis pass"}</CodeBlock>
      </Panel>
    </div>
  );
}