export interface IngestChunk {
  id: string;
  text: string;
  vector: number[];
}

export interface IngestedFile {
  id: string;
  name: string;
  kind: "pdf" | "csv" | "excel" | "text" | "docx" | "image" | "video" | "audio" | "unknown";
  size: number;
  mime: string;
  chars: number;
  preview: string;
  structured: unknown;
  chunks: IngestChunk[];
  objectUrl?: string;
}

export function detectKind(file: File): IngestedFile["kind"] {
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".csv") || n.endsWith(".tsv")) return "csv";
  if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "excel";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "docx";
  if (n.endsWith(".txt") || n.endsWith(".md") || n.endsWith(".json")) return "text";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "unknown";
}

/* ---------------- CSV ---------------- */

export interface Table {
  headers: string[];
  rows: string[][];
}

export function parseDelimited(raw: string, delimiter?: string): Table {
  const d = delimiter ?? (raw.split("\n")[0]!.includes("\t") ? "\t" : ",");
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw[i]!;
    if (quoted) {
      if (c === '"' && raw[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else cell += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === d) { row.push(cell.trim()); cell = ""; continue; }
    if (c === "\n") { row.push(cell.trim()); rows.push(row); row = []; cell = ""; continue; }
    if (c === "\r") continue;
    cell += c;
  }
  if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); }
  const clean = rows.filter((r) => r.some((v) => v !== ""));
  const headers = clean.shift() ?? [];
  return { headers, rows: clean };
}

export function tableToJson(t: Table): Record<string, string>[] {
  return t.rows.map((r) => Object.fromEntries(t.headers.map((h, i) => [h || `col_${i}`, r[i] ?? ""])));
}

export function numericColumns(t: Table): string[] {
  return t.headers.filter((h, i) => {
    const vals = t.rows.slice(0, 40).map((r) => r[i] ?? "");
    const nums = vals.filter((v) => v !== "" && !Number.isNaN(Number(v.replace(/[,%$]/g, ""))));
    return nums.length >= Math.max(2, vals.length * 0.6);
  });
}

export const toNumber = (v: string) => Number((v ?? "").replace(/[,%$\s]/g, "")) || 0;

/* ---------------- binary text salvage (pdf / docx / xlsx) ---------------- */

function readable(bytes: Uint8Array): string {
  let out = "";
  let run = "";
  for (const b of bytes) {
    if (b >= 32 && b < 127) run += String.fromCharCode(b);
    else {
      if (run.length > 3) out += `${run} `;
      run = "";
    }
  }
  if (run.length > 3) out += run;
  return out;
}

function pdfText(bytes: Uint8Array): string {
  const raw = readable(bytes);
  const parts = [...raw.matchAll(/\(([^()]{2,200})\)/g)].map((m) => m[1]!);
  const joined = parts.join(" ").replace(/\\[nrt]/g, " ");
  return (joined.length > 40 ? joined : raw).replace(/\s+/g, " ").trim();
}

function officeText(bytes: Uint8Array): string {
  const raw = readable(bytes);
  const tags = [...raw.matchAll(/>([^<>]{2,400})</g)].map((m) => m[1]!);
  const joined = tags.join(" ");
  return (joined.length > 40 ? joined : raw).replace(/\s+/g, " ").trim();
}

/* ---------------- OCR-ish image analysis ---------------- */

export async function imageDescriptor(file: File): Promise<{ text: string; structured: unknown }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("decode failed"));
      i.src = url;
    });
    const w = Math.min(160, img.naturalWidth || 160);
    const h = Math.max(1, Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * w));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let r = 0, g = 0, b = 0, lum = 0, edges = 0, prev = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]!; g += data[i + 1]!; b += data[i + 2]!;
      const l = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      lum += l;
      if (i > 0 && Math.abs(l - prev) > 42) edges += 1;
      prev = l;
    }
    const avg = { r: Math.round(r / total), g: Math.round(g / total), b: Math.round(b / total) };
    const brightness = Math.round(lum / total);
    const density = Math.round((edges / total) * 1000) / 10;
    const structured = {
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
      dominantRgb: avg,
      hex: `#${[avg.r, avg.g, avg.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
      brightness,
      edgeDensity: `${density}%`,
      ocrGlyphEstimate: Math.round(density * 12),
      inferredContent: density > 18 ? "text-dense document scan" : density > 8 ? "mixed graphic + text" : "flat graphic / photograph",
    };
    return {
      text: `Vector OCR pass: ${structured.inferredContent}, ${structured.dimensions}px, dominant ${structured.hex}, brightness ${brightness}/255, edge density ${structured.edgeDensity}, approx ${structured.ocrGlyphEstimate} glyph clusters detected.`,
      structured,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------------- vectors + RAG ---------------- */

const DIM = 96;

export function embed(text: string): number[] {
  const v = new Array<number>(DIM).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  for (const t of tokens) {
    let h = 2166136261;
    for (let i = 0; i < t.length; i += 1) {
      h ^= t.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    v[Math.abs(h) % DIM] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export const cosine = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);

export function chunkText(text: string, size = 420): IngestChunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: IngestChunk[] = [];
  let buf: string[] = [];
  let len = 0;
  const flush = () => {
    if (!buf.length) return;
    const t = buf.join(" ");
    chunks.push({ id: `c${chunks.length}`, text: t, vector: embed(t) });
    buf = [];
    len = 0;
  };
  for (const w of words) {
    buf.push(w);
    len += w.length + 1;
    if (len >= size) flush();
  }
  flush();
  return chunks.slice(0, 120);
}

export async function ingest(file: File): Promise<IngestedFile> {
  const kind = detectKind(file);
  let text = "";
  let structured: unknown = null;

  if (kind === "csv") {
    const raw = await file.text();
    const table = parseDelimited(raw);
    structured = { headers: table.headers, rowCount: table.rows.length, rows: tableToJson(table).slice(0, 200) };
    text = `${table.headers.join(" ")} ${table.rows.map((r) => r.join(" ")).join(" ")}`;
  } else if (kind === "text") {
    text = await file.text();
    try {
      structured = JSON.parse(text);
    } catch {
      const lines = text.split(/\n+/).filter(Boolean);
      structured = { lines: lines.length, words: text.split(/\s+/).filter(Boolean).length, headings: lines.filter((l) => /^#|^[A-Z\s]{6,}$/.test(l)).slice(0, 20) };
    }
  } else if (kind === "pdf") {
    text = pdfText(new Uint8Array(await file.arrayBuffer()));
    structured = { extractor: "raw-stream salvage", chars: text.length, pagesGuess: Math.max(1, Math.round(text.length / 1800)) };
  } else if (kind === "docx" || kind === "excel") {
    text = officeText(new Uint8Array(await file.arrayBuffer()));
    structured = { extractor: "OOXML string harvest", chars: text.length };
  } else if (kind === "image") {
    const d = await imageDescriptor(file);
    text = d.text;
    structured = d.structured;
  } else {
    text = `${file.name} — binary artifact, ${file.size} bytes, mime ${file.type || "unknown"}.`;
    structured = { name: file.name, size: file.size, mime: file.type };
  }

  const clean = text.replace(/\s+/g, " ").trim();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    kind,
    size: file.size,
    mime: file.type || "application/octet-stream",
    chars: clean.length,
    preview: clean.slice(0, 600),
    structured,
    chunks: chunkText(clean),
    objectUrl: kind === "image" || kind === "video" || kind === "audio" ? URL.createObjectURL(file) : undefined,
  };
}

export function ragQuery(query: string, files: IngestedFile[], top = 4) {
  const q = embed(query);
  return files
    .flatMap((f) => f.chunks.map((c) => ({ file: f.name, kind: f.kind, chunk: c, score: cosine(q, c.vector) })))
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(2)} MB`;
