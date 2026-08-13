export function SpectrumEqualizer({
  bars,
  active,
}: {
  bars: number[];
  active: boolean;
}) {
  return (
    <div
      className="flex h-32 items-end gap-[3px] rounded border border-border/60 bg-background/70 p-3"
      aria-hidden
    >
      {bars.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-[height] duration-75"
          style={{
            height: `${Math.max(3, v)}%`,
            background:
              i % 2 === 0
                ? "linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent)))"
                : "linear-gradient(to top, hsl(var(--accent)), hsl(var(--primary)))",
            opacity: active ? 1 : 0.45,
            boxShadow: active ? "0 0 6px hsl(var(--primary) / 0.5)" : "none",
          }}
        />
      ))}
    </div>
  );
}