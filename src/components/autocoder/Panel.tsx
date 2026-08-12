import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Panel({
  icon: Icon,
  title,
  tag,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  tag?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`hud-panel rounded-lg p-4 ${className}`}>
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-border/60 pb-2">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        {tag ? (
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent">{tag}</span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="max-h-72 overflow-auto rounded border border-border/60 bg-background/70 p-3 text-[11px] leading-relaxed text-muted-foreground">
      <code>{children}</code>
    </pre>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-xs outline-none transition-colors focus:border-accent"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none transition-colors focus:border-accent"
        />
      )}
    </label>
  );
}

export function ActionButton({
  onClick,
  children,
  variant = "primary",
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "accent" | "ghost";
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "border-primary bg-primary/15 text-primary hover:bg-primary/30"
      : variant === "accent"
        ? "border-accent bg-accent/15 text-accent hover:bg-accent/30"
        : "border-border text-muted-foreground hover:border-accent hover:text-accent";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}
