import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  FileArchive,
  Monitor,
  Play,
  Smartphone,
  Tablet,
  Terminal as TerminalIcon,
  Trash2,
  Wand2,
} from "lucide-react";
import { ActionButton, Panel } from "./Panel";
import { useSandbox } from "@/hooks/useSandbox";
import { ARTIFACTS, offlineHtml } from "@/lib/sandboxTemplates";
import { createZip, downloadBlob } from "@/lib/zip";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "390px", icon: Smartphone },
] as const;

const LINE_STYLES: Record<string, string> = {
  error: "text-primary",
  warn: "text-yellow-400",
  patch: "text-accent",
  build: "text-accent",
  log: "text-muted-foreground",
  info: "text-muted-foreground",
};

export function SandboxStudio() {
  const s = useSandbox();
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]["id"]>("desktop");
  const errors = s.issues.filter((i) => i.severity === "error");
  const vp = VIEWPORTS.find((v) => v.id === viewport)!;

  const lineNumbers = useMemo(
    () => s.code.split("\n").map((_, i) => i + 1),
    [s.code],
  );

  const exportZip = () => {
    const ext = s.kind === "css" ? "html" : s.kind === "react" ? "jsx" : s.kind === "three" ? "js" : s.kind;
    const blob = createZip([
      { name: `devil-artifact/index.html`, content: offlineHtml(s.kind, s.code) },
      { name: `devil-artifact/source.${ext}`, content: s.code },
      {
        name: "devil-artifact/README.md",
        content: `# DEVIL Auto-Coder Artifact\n\nKind: ${s.kind}\nAST nodes: ${s.astNodes}\nGenerated: ${new Date().toISOString()}\n\nOpen index.html — fully offline, zero build step.\n`,
      },
    ]);
    downloadBlob(blob, "devil-artifact.zip");
    s.log("build", "packaged artifact → devil-artifact.zip (3 entries)");
  };

  const exportHtml = () => {
    downloadBlob(new Blob([offlineHtml(s.kind, s.code)], { type: "text/html" }), "devil-artifact.html");
    s.log("build", "packaged single offline artifact → devil-artifact.html");
  };

  const injectFault = () => {
    s.setCode(`${s.code}\n// injected fault for mutator demo\nconsole.log(devilPayloadRegistry.status);\n`);
    s.log("warn", "fault injected — awaiting compile to trigger self-healing mutator");
  };

  return (
    <div className="space-y-4">
      <Panel icon={Cpu} title="Isolated Worker Sandbox" tag="feat 11 · 12">
        <div className="flex flex-wrap items-center gap-2">
          {ARTIFACTS.map((a) => (
            <button
              key={a.id}
              onClick={() => s.selectKind(a.id)}
              className={`rounded border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                s.kind === a.id
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/60"
              }`}
            >
              {a.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <ActionButton onClick={s.run}>
              <Play className="h-3.5 w-3.5" /> Compile
            </ActionButton>
            <ActionButton onClick={exportZip} variant="accent">
              <FileArchive className="h-3.5 w-3.5" /> .zip
            </ActionButton>
            <ActionButton onClick={exportHtml} variant="accent">
              <Download className="h-3.5 w-3.5" /> .html
            </ActionButton>
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-[10px] uppercase tracking-[0.2em] sm:grid-cols-4">
          <Stat label="AST nodes" value={String(s.astNodes)} />
          <Stat label="Worker" value={s.compiling ? "parsing" : "idle"} />
          <Stat label="Errors" value={String(errors.length)} bad={errors.length > 0} />
          <Stat label="Mutator" value={s.autoHeal ? "armed" : "off"} />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel icon={Wand2} title="Code Editor · Live AST" tag="ast guard">
          <div className="mb-2 flex gap-2">
            <TabBtn active={tab === "editor"} onClick={() => setTab("editor")}>
              Editor
            </TabBtn>
            <TabBtn active={tab === "preview"} onClick={() => setTab("preview")}>
              Diagnostics
            </TabBtn>
          </div>
          {tab === "editor" ? (
            <div className="flex max-h-[420px] overflow-auto rounded border border-border/60 bg-background/80">
              <div className="select-none border-r border-border/60 px-2 py-2 text-right font-mono text-[11px] leading-5 text-muted-foreground/60">
                {lineNumbers.map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              <textarea
                value={s.code}
                spellCheck={false}
                onChange={(e) => s.setCode(e.target.value)}
                aria-label="Sandbox code editor"
                className="min-h-[400px] w-full resize-none bg-transparent p-2 font-mono text-[11px] leading-5 outline-none"
              />
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-auto">
              {s.issues.length === 0 ? (
                <p className="flex items-center gap-2 text-xs text-accent">
                  <CheckCircle2 className="h-4 w-4" /> AST clean — no syntax anomalies detected.
                </p>
              ) : (
                s.issues.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded border border-border/60 bg-background/60 p-2 text-[11px]"
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-3.5 w-3.5 ${i.severity === "error" ? "text-primary" : "text-yellow-400"}`}
                    />
                    <span>
                      <span className="text-muted-foreground">line {i.line}</span> — {i.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </Panel>

        <Panel icon={Monitor} title="Live Render Viewport" tag="feat 23 · emulator">
          <div className="mb-2 flex items-center gap-2">
            {VIEWPORTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                aria-label={`${v.label} viewport`}
                className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  viewport === v.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/60"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{vp.width}</span>
          </div>
          <div className="grid h-[420px] place-items-start justify-center overflow-auto rounded border border-border/60 bg-black/60 p-2">
            {s.doc ? (
              <iframe
                title="DEVIL sandbox viewport"
                sandbox="allow-scripts allow-modals"
                srcDoc={s.doc}
                style={{ width: vp.width }}
                className="h-[400px] rounded border border-accent/30 bg-[#030005]"
              />
            ) : (
              <p className="m-auto text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                viewport empty — press compile
              </p>
            )}
          </div>
        </Panel>
      </div>

      <Panel icon={TerminalIcon} title="Sandbox Terminal · Self-Healing Mutator" tag="feat 13">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <ActionButton onClick={() => s.setAutoHeal(!s.autoHeal)} variant={s.autoHeal ? "accent" : "ghost"}>
            <Wand2 className="h-3.5 w-3.5" /> Auto-heal {s.autoHeal ? "on" : "off"}
          </ActionButton>
          <ActionButton onClick={injectFault} variant="ghost">
            <AlertTriangle className="h-3.5 w-3.5" /> Inject fault
          </ActionButton>
          <ActionButton onClick={s.clearTerminal} variant="ghost">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </ActionButton>
        </div>
        <div className="h-56 overflow-auto rounded border border-border/60 bg-black/70 p-3 font-mono text-[11px] leading-relaxed">
          {s.lines.map((l) => (
            <div key={l.id} className={LINE_STYLES[l.kind]}>
              <span className="text-muted-foreground/50">[{l.at}]</span>{" "}
              <span className="uppercase">{l.kind}</span> {l.text}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="rounded border border-border/60 bg-background/60 px-3 py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-sm ${bad ? "text-primary" : "text-accent"}`}>{value}</p>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
        active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
