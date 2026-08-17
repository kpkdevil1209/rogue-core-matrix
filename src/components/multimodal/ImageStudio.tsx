import { useEffect, useRef, useState } from "react";
import { Box, Image as ImageIcon, Wand2 } from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { useSystemStore } from "@/store/useSystemStore";

const MODELS = ["flux.1-schnell", "flux.1-dev", "sdxl-turbo", "sd3-medium"] as const;

function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function ImageStudio() {
  const [prompt, setPrompt] = useState("crimson neon skull lattice inside a black server cathedral");
  const [model, setModel] = useState<(typeof MODELS)[number]>("flux.1-schnell");
  const [steps, setSteps] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLCanvasElement>(null);
  const pushLog = useSystemStore((s) => s.pushLog);

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const seed = seedFrom(prompt + model);
    const rand = (n: number) => ((seed * (n + 7)) % 1000) / 1000;
    const { width: w, height: h } = canvas;
    ctx.fillStyle = "#030005";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i += 1) {
      const x = rand(i) * w;
      const y = rand(i * 3) * h;
      const r = 6 + rand(i * 5) * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const crimson = i % 2 === 0;
      g.addColorStop(0, crimson ? "rgba(255,0,51,0.42)" : "rgba(157,0,255,0.42)");
      g.addColorStop(1, "rgba(3,0,5,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,0,51,0.25)";
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath();
      ctx.moveTo(rand(i * 11) * w, 0);
      ctx.lineTo(rand(i * 13) * w, h);
      ctx.stroke();
    }
    setSteps(0);
    const timer = window.setInterval(() => {
      setSteps((s) => {
        if (s >= 100) {
          window.clearInterval(timer);
          pushLog(`[GEN] ${model} latents resolved for "${prompt.slice(0, 32)}…"`);
          return 100;
        }
        return s + 5;
      });
    }, 60);
  };

  useEffect(() => {
    const canvas = threeRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let a = 0;
    const verts: [number, number, number][] = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    const loop = () => {
      a += 0.012;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const pts = verts.map(([x, y, z]) => {
        const x1 = x * Math.cos(a) - z * Math.sin(a);
        const z1 = x * Math.sin(a) + z * Math.cos(a);
        const y1 = y * Math.cos(a * 0.7) - z1 * Math.sin(a * 0.7);
        const z2 = y * Math.sin(a * 0.7) + z1 * Math.cos(a * 0.7);
        const p = 2.6 / (3.4 + z2);
        return [w / 2 + x1 * p * w * 0.32, h / 2 + y1 * p * h * 0.32] as const;
      });
      ctx.lineWidth = 1.4;
      edges.forEach(([i, j], k) => {
        ctx.strokeStyle = k % 2 ? "rgba(157,0,255,0.85)" : "rgba(255,0,51,0.85)";
        ctx.beginPath();
        ctx.moveTo(pts[i]![0], pts[i]![1]);
        ctx.lineTo(pts[j]![0], pts[j]![1]);
        ctx.stroke();
      });
      raf = window.requestAnimationFrame(loop);
    };
    loop();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Panel icon={ImageIcon} title="Text-to-Image Diffusion Bay" tag={model.toUpperCase()}>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {MODELS.map((m) => (
            <ActionButton key={m} variant={model === m ? "accent" : "ghost"} onClick={() => setModel(m)}>
              {m}
            </ActionButton>
          ))}
          <ActionButton onClick={render}>
            <Wand2 className="h-3.5 w-3.5" /> Synthesize
          </ActionButton>
        </div>
        <div className="mt-2 h-1 rounded bg-border/60">
          <div className="h-full rounded bg-accent transition-all" style={{ width: `${steps}%` }} />
        </div>
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="mt-3 w-full rounded border border-primary/40 bg-background"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Latent preview rendered fully on-device — deterministic per prompt seed, {steps}% denoised.
        </p>
      </Panel>

      <Panel icon={Box} title="3D Canvas Viewport" tag="WIREFRAME">
        <canvas ref={threeRef} width={420} height={340} className="w-full rounded border border-accent/40 bg-background" />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Live rotating mesh renderer for inspecting generated 3D artifacts before export.
        </p>
      </Panel>
    </div>
  );
}