import { useRef, useState } from "react";
import { AudioWaveform, Camera, Code2, Languages, PenTool } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { LANGUAGES, optimizePath, readExif, SAMPLE_PATH, translate, type ExifResult, type PathStats } from "@/lib/mediaTools";

function ExifTool() {
  const [result, setResult] = useState<ExifResult | null>(null);
  const [name, setName] = useState("");
  return (
    <Panel icon={Camera} title="Image EXIF Extractor" tag="PRIVACY">
      <label className="block cursor-pointer rounded border border-dashed border-border p-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-accent">
        Drop JPEG for metadata sweep
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setName(f.name);
            setResult(readExif(await f.arrayBuffer()));
          }}
        />
      </label>
      {result ? (
        <div className="mt-3 space-y-2">
          <p className="font-mono text-[11px] text-accent">{name}</p>
          <dl className="grid grid-cols-2 gap-1.5 text-[11px]">
            {Object.entries(result.tags).map(([k, v]) => (
              <div key={k} className="rounded border border-border/60 bg-background/60 p-1.5">
                <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                <dd className="truncate font-mono">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-1">
            {result.warnings.map((w) => (
              <li key={w} className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                {w}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

function WaveformTool() {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [meta, setMeta] = useState<string>("");
  return (
    <Panel icon={AudioWaveform} title="Audio Waveform Visualizer" tag="PCM">
      <label className="block cursor-pointer rounded border border-dashed border-border p-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-accent">
        Load audio file
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ctx = new AC();
            const buf = await ctx.decodeAudioData(await f.arrayBuffer());
            const ch = buf.getChannelData(0);
            const bins = 96;
            const step = Math.floor(ch.length / bins);
            const out: number[] = [];
            for (let i = 0; i < bins; i += 1) {
              let max = 0;
              for (let j = 0; j < step; j += 64) max = Math.max(max, Math.abs(ch[i * step + j] ?? 0));
              out.push(max);
            }
            setPeaks(out);
            setMeta(`${f.name} · ${buf.duration.toFixed(2)}s · ${buf.sampleRate} Hz · ${buf.numberOfChannels}ch`);
            void ctx.close();
          }}
        />
      </label>
      <div className="mt-3 flex h-28 items-center gap-[2px] rounded border border-border/60 bg-background/60 p-2">
        {(peaks.length ? peaks : Array.from({ length: 96 }, () => 0.04)).map((p, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${Math.max(3, p * 100)}%`,
              background: i % 2 ? "oklch(0.62 0.28 300)" : "oklch(0.62 0.28 12)",
            }}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-accent">{meta || "no stream decoded"}</p>
    </Panel>
  );
}

function SvgTool() {
  const [d, setD] = useState(SAMPLE_PATH);
  const [stats, setStats] = useState<PathStats | null>(null);
  return (
    <Panel icon={PenTool} title="SVG Path Editor / Optimizer" tag="VECTOR">
      <textarea
        rows={4}
        value={d}
        onChange={(e) => setD(e.target.value)}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
      />
      <div className="mt-2 flex gap-2">
        <ActionButton onClick={() => setStats(optimizePath(d))}>Optimize</ActionButton>
        {stats ? <ActionButton variant="ghost" onClick={() => setD(stats.optimized)}>Apply</ActionButton> : null}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <svg viewBox="0 0 120 140" className="h-40 w-full rounded border border-border/60 bg-background/60">
          <path d={d} fill="none" stroke="oklch(0.62 0.28 12)" strokeWidth="2" />
        </svg>
        <div className="space-y-1 text-[11px] text-muted-foreground">
          {stats ? (
            <>
              <p>commands: <span className="text-accent">{stats.commands}</span></p>
              <p>{stats.originalLength} → {stats.optimizedLength} chars</p>
              <p>saved: <span className="text-accent">{stats.savedPct}%</span></p>
              {stats.issues.map((i) => (
                <p key={i} className="text-primary">! {i}</p>
              ))}
            </>
          ) : (
            <p>Run the optimizer for stats.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

const THEMES = {
  crimson: { bg: "#12000a", accent: "#FF0033" },
  neon: { bg: "#0b0016", accent: "#9D00FF" },
  void: { bg: "#030005", accent: "#7dd3fc" },
} as const;

function SnippetTool() {
  const [code, setCode] = useState(`const devil = await Devil.boot({\n  autonomy: "max",\n  guardrails: true,\n});\n\ndevil.run("exfiltrate nothing, build everything");`);
  const [theme, setTheme] = useState<keyof typeof THEMES>("crimson");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const lines = code.split("\n");
    const pad = 28;
    const lh = 22;
    canvas.width = 760;
    canvas.height = pad * 2 + 34 + lines.length * lh;
    const t = THEMES[theme];
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `${t.accent}55`;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    ["#FF5F56", "#FFBD2E", "#27C93F"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(pad + i * 18, pad, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = '14px ui-monospace, "SFMono-Regular", monospace';
    lines.forEach((l, i) => {
      ctx.fillStyle = `${t.accent}88`;
      ctx.fillText(String(i + 1).padStart(2, " "), pad, pad + 40 + i * lh);
      ctx.fillStyle = /\b(const|await|return|function|let|import|export)\b/.test(l) ? t.accent : "#dbe5ee";
      ctx.fillText(l, pad + 34, pad + 40 + i * lh);
    });
  };

  return (
    <Panel icon={Code2} title="Code Snippet → Image" tag="CARBON">
      <textarea
        rows={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map((k) => (
          <ActionButton key={k} variant={theme === k ? "accent" : "ghost"} onClick={() => setTheme(k)}>
            {k}
          </ActionButton>
        ))}
        <ActionButton onClick={draw}>Render</ActionButton>
        <ActionButton
          variant="ghost"
          onClick={() => {
            const url = canvasRef.current?.toDataURL("image/png");
            if (!url) return;
            const a = document.createElement("a");
            a.href = url;
            a.download = "devil-snippet.png";
            a.click();
          }}
        >
          Download PNG
        </ActionButton>
      </div>
      <canvas ref={canvasRef} className="mt-3 w-full rounded border border-border/60" />
    </Panel>
  );
}

function TranslatorTool() {
  const [text, setText] = useState("hello world, the system has power in code");
  const [target, setTarget] = useState("ur");
  const res = translate(text, target);
  return (
    <Panel icon={Languages} title="Multi-Language Translator" tag={`${LANGUAGES.length} LANGS`}>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
      />
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background/70 px-2.5 py-2 text-xs outline-none focus:border-accent"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name} — {l.native}
          </option>
        ))}
      </select>
      <p className="mt-3 rounded border border-accent/40 bg-accent/5 p-2.5 text-sm text-accent">{res.output}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        lexicon coverage {res.matched}/{res.total} tokens mapped offline.
      </p>
    </Panel>
  );
}

export function MediaUtilities() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ExifTool />
      <WaveformTool />
      <SvgTool />
      <TranslatorTool />
      <div className="lg:col-span-2">
        <SnippetTool />
      </div>
    </div>
  );
}