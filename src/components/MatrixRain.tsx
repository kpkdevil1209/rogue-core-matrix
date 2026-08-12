import { useEffect, useRef } from "react";

export function MatrixRain({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "アカサタナ01ハマヤラワ†ΣΔΩ#@$%DEVIL".split("");
    let columns = 0;
    let drops: number[] = [];
    const size = 14;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.ceil(canvas.width / size);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(3, 0, 5, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size}px monospace`;
      for (let i = 0; i < drops.length; i += 1) {
        ctx.fillStyle = i % 3 === 0 ? "#9D00FF" : "#FF0033";
        ctx.fillText(
          chars[Math.floor(Math.random() * chars.length)]!,
          i * size,
          drops[i]! * size,
        );
        if (drops[i]! * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] = drops[i]! + 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-25"
    />
  );
}