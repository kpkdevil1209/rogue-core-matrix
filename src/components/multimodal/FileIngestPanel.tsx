import { useCallback, useRef, useState } from "react";
import { Braces, FileStack, Search, Trash2, UploadCloud } from "lucide-react";
import { ActionButton, CodeBlock, Panel } from "@/components/autocoder/Panel";
import { formatBytes, ingest, ragQuery, type IngestedFile } from "@/lib/fileIngest";
import { useSystemStore } from "@/store/useSystemStore";

export function FileIngestPanel() {
  const [files, setFiles] = useState<IngestedFile[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [query, setQuery] = useState("what is this document about");
  const [hits, setHits] = useState<ReturnType<typeof ragQuery>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pushLog = useSystemStore((s) => s.pushLog);

  const absorb = useCallback(
    async (list: FileList | null) => {
      if (!list || !list.length) return;
      setBusy(true);
      const next: IngestedFile[] = [];
      for (const f of Array.from(list)) {
        try {
          const parsed = await ingest(f);
          next.push(parsed);
          pushLog(`[OCR] ${f.name} → ${parsed.chunks.length} vector chunks (${parsed.kind})`);
        } catch {
          pushLog(`[OCR] ${f.name} rejected — unreadable container`);
        }
      }
      setFiles((prev) => [...next, ...prev]);
      setActive(next[0]?.id ?? null);
      setBusy(false);
    },
    [pushLog],
  );

  const current = files.find((f) => f.id === active) ?? files[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <Panel icon={UploadCloud} title="Vector OCR Intake" tag="RAG CORE">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              void absorb(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded border border-dashed p-6 text-center transition-colors ${
              drag ? "border-primary bg-primary/10" : "border-border hover:border-accent/70"
            }`}
          >
            <UploadCloud className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em]">
              {busy ? "Ingesting…" : "Drop PDF · CSV · XLSX · DOCX · TXT · Images"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Everything is parsed, chunked and embedded locally — nothing leaves the device.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void absorb(e.target.files)}
          />
          {files.length ? (
            <ul className="mt-3 space-y-1.5">
              {files.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => setActive(f.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded border px-2.5 py-2 text-left text-[11px] transition-colors ${
                      current?.id === f.id ? "border-accent text-accent" : "border-border/60 text-muted-foreground hover:border-accent/60"
                    }`}
                  >
                    <span className="truncate font-mono">{f.name}</span>
                    <span className="shrink-0 uppercase tracking-[0.2em]">
                      {f.kind} · {formatBytes(f.size)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {files.length ? (
            <div className="mt-3">
              <ActionButton
                variant="ghost"
                onClick={() => {
                  setFiles([]);
                  setHits([]);
                  setActive(null);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Purge corpus
              </ActionButton>
            </div>
          ) : null}
        </Panel>

        <Panel icon={Search} title="Local RAG Query" tag={`${files.reduce((s, f) => s + f.chunks.length, 0)} chunks`}>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the corpus…"
              className="w-full rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
            />
            <ActionButton onClick={() => setHits(ragQuery(query, files))} disabled={!files.length}>
              Retrieve
            </ActionButton>
          </div>
          <ul className="mt-3 space-y-2">
            {hits.map((h, i) => (
              <li key={i} className="rounded border border-border/60 bg-background/60 p-2.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-accent">
                  <span className="truncate">{h.file}</span>
                  <span>score {(h.score * 100).toFixed(1)}%</span>
                </div>
                <p className="mt-1.5 line-clamp-4 text-[11px] leading-relaxed text-muted-foreground">{h.chunk.text}</p>
              </li>
            ))}
            {!hits.length ? (
              <li className="text-[11px] text-muted-foreground">No retrieval yet — ingest files and run a query.</li>
            ) : null}
          </ul>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel icon={FileStack} title="Extraction Preview" tag={current ? current.kind.toUpperCase() : "IDLE"}>
          {current ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Name", current.name],
                  ["MIME", current.mime],
                  ["Size", formatBytes(current.size)],
                  ["Chars", String(current.chars)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded border border-border/60 bg-background/60 p-2">
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 truncate font-mono text-accent">{v}</dd>
                  </div>
                ))}
              </dl>
              {current.objectUrl && current.kind === "image" ? (
                <img
                  src={current.objectUrl}
                  alt={`Ingested preview of ${current.name}`}
                  className="mt-3 max-h-52 w-full rounded border border-border/60 object-contain"
                />
              ) : null}
              <p className="mt-3 max-h-32 overflow-auto text-[11px] leading-relaxed text-muted-foreground">
                {current.preview || "No extractable text layer."}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground">Awaiting artifacts.</p>
          )}
        </Panel>

        <Panel icon={Braces} title="Structured JSON" tag="NORMALIZED">
          <CodeBlock>{current ? JSON.stringify(current.structured, null, 2) : "{}"}</CodeBlock>
        </Panel>
      </div>
    </div>
  );
}