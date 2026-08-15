import { useMemo, useRef, useState } from "react";
import {
  Binary,
  EyeOff,
  FileKey,
  Hash,
  Image as ImageIcon,
  Network,
  Radar,
} from "lucide-react";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import {
  COMMON_PORTS,
  calcSubnet,
  decodeBase64,
  decodeHex,
  embedLsbPayload,
  encodeBase64,
  encodeHex,
  extractLsbPayload,
  inspectJwt,
  md5,
  scanPort,
  type StegoResult,
} from "@/lib/forensics";
import { useSystemStore } from "@/store/useSystemStore";
import type { PortResult } from "@/types/security";
import { sha } from "@/lib/forensics";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-1">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-[11px] text-accent">{value}</span>
    </div>
  );
}

function SubnetTool() {
  const [cidr, setCidr] = useState("10.13.37.42/26");
  const info = useMemo(() => calcSubnet(cidr), [cidr]);
  return (
    <Panel icon={Network} title="Subnet / CIDR Calculator" tag="ipv4">
      <input
        value={cidr}
        onChange={(e) => setCidr(e.target.value)}
        className="w-full rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
      />
      {info.error && <p className="mt-2 text-[11px] text-primary">{info.error}</p>}
      <div className="mt-3">
        <Row label="network" value={info.network} />
        <Row label="broadcast" value={info.broadcast} />
        <Row label="host range" value={`${info.firstHost} – ${info.lastHost}`} />
        <Row label="netmask" value={info.mask} />
        <Row label="wildcard" value={info.wildcard} />
        <Row label="usable hosts" value={info.hosts.toLocaleString()} />
        <Row label="class / scope" value={`${info.class} · ${info.private ? "private" : "public"}`} />
      </div>
    </Panel>
  );
}

function HashTool() {
  const [text, setText] = useState("devil://root");
  const [out, setOut] = useState<Record<string, string>>({});
  const run = async () => {
    setOut({
      MD5: md5(text),
      "SHA-1": await sha("SHA-1", text),
      "SHA-256": await sha("SHA-256", text),
      "SHA-512": await sha("SHA-512", text),
    });
  };
  return (
    <Panel icon={Hash} title="Hash Generator" tag="md5 / sha">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-xs outline-none focus:border-accent"
      />
      <div className="mt-2">
        <ActionButton variant="primary" onClick={() => void run()}>
          Digest
        </ActionButton>
      </div>
      <div className="mt-3 space-y-1">
        {Object.entries(out).map(([k, v]) => (
          <div key={k}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</p>
            <p className="break-all font-mono text-[11px] text-accent">{v}</p>
          </div>
        ))}
        {Object.keys(out).length === 0 && (
          <p className="text-[11px] text-muted-foreground">no digests computed</p>
        )}
      </div>
    </Panel>
  );
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZpbC1yb290IiwibmFtZSI6IkRFVklMIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.Xy9fakesignaturefakesignature";

function JwtTool() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const info = useMemo(() => inspectJwt(token), [token]);
  return (
    <Panel icon={FileKey} title="JWT Token Inspector" tag="decode only">
      <textarea
        rows={3}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        spellCheck={false}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
      />
      {info.error && <p className="mt-2 text-[11px] text-primary">{info.error}</p>}
      {info.valid && (
        <>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span className="rounded border border-accent/60 px-2 py-0.5 text-accent">alg {info.alg}</span>
            <span
              className={`rounded border px-2 py-0.5 ${info.expired ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
            >
              {info.expired ? "expired" : "unexpired"}
            </span>
            {info.expiresAt && (
              <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
                exp {info.expiresAt}
              </span>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <pre className="max-h-40 overflow-auto rounded border border-border/60 bg-background/70 p-2 font-mono text-[11px] text-muted-foreground">
              {info.header}
            </pre>
            <pre className="max-h-40 overflow-auto rounded border border-border/60 bg-background/70 p-2 font-mono text-[11px] text-muted-foreground">
              {info.payload}
            </pre>
          </div>
          <ul className="mt-2 space-y-1">
            {info.warnings.map((w) => (
              <li key={w} className="text-[11px] text-primary">
                ▲ {w}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

function PortTool() {
  const [host, setHost] = useState("target.devil.net");
  const [results, setResults] = useState<PortResult[]>([]);
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setResults([]);
    setScanning(true);
    COMMON_PORTS.forEach((p, i) => {
      window.setTimeout(() => {
        setResults((r) => [...r, scanPort(host, p)]);
        if (i === COMMON_PORTS.length - 1) setScanning(false);
      }, i * 45);
    });
  };

  return (
    <Panel icon={Radar} title="Port Scanner Simulator" tag="deterministic">
      <div className="flex gap-2">
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="flex-1 rounded border border-border bg-background/70 px-2.5 py-2 font-mono text-xs outline-none focus:border-accent"
        />
        <ActionButton variant="primary" onClick={scan} disabled={scanning}>
          {scanning ? "Scanning…" : "Sweep"}
        </ActionButton>
      </div>
      <div className="mt-3 grid max-h-52 grid-cols-2 gap-1 overflow-auto sm:grid-cols-3">
        {results.map((r) => (
          <div
            key={r.port}
            className={`rounded border px-2 py-1 font-mono text-[11px] ${
              r.state === "open"
                ? "border-primary/70 bg-primary/10 text-primary"
                : r.state === "filtered"
                  ? "border-accent/50 text-accent"
                  : "border-border/60 text-muted-foreground"
            }`}
          >
            {r.port}/{r.service}
            <span className="ml-1 opacity-70">{r.state}</span>
          </div>
        ))}
        {results.length === 0 && (
          <p className="col-span-full text-[11px] text-muted-foreground">no sweep executed</p>
        )}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Simulated topology — no packets leave this device.
      </p>
    </Panel>
  );
}

function CodecTool() {
  const [value, setValue] = useState("DEVIL rogue payload");
  const [mode, setMode] = useState<"b64e" | "b64d" | "hexe" | "hexd">("b64e");
  const out =
    mode === "b64e"
      ? encodeBase64(value)
      : mode === "b64d"
        ? decodeBase64(value)
        : mode === "hexe"
          ? encodeHex(value)
          : decodeHex(value);
  const MODES = [
    { id: "b64e", label: "b64 encode" },
    { id: "b64d", label: "b64 decode" },
    { id: "hexe", label: "hex encode" },
    { id: "hexd", label: "hex decode" },
  ] as const;
  return (
    <Panel icon={Binary} title="Base64 / Hex Codec" tag="bidirectional">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors ${
              mode === m.id
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted-foreground hover:border-accent/60"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-xs outline-none focus:border-accent"
      />
      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-border/60 bg-background/70 p-2 font-mono text-[11px] text-accent">
        {out}
      </pre>
    </Panel>
  );
}

function StegoTool() {
  const [result, setResult] = useState<StegoResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (blobUrl: string) => {
    const img = new Image();
    img.src = blobUrl;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    if (!ctx) {
      setNote("Canvas 2D unavailable on this device");
      return;
    }
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    setResult(extractLsbPayload(data));
  };

  const onFile = (f: File) => {
    setNote(null);
    const url = URL.createObjectURL(f);
    void analyze(url).finally(() => URL.revokeObjectURL(url));
  };

  const forgeCarrier = () => {
    setNote(null);
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) {
      setNote("Canvas 2D unavailable on this device");
      return;
    }
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        ctx.fillStyle = `rgb(${(x * 4) % 256},${(y * 4) % 256},${(x + y) % 256})`;
        ctx.fillRect(x, y, 1, 1);
      }
    const img = ctx.getImageData(0, 0, 64, 64);
    embedLsbPayload(img.data, "DEVIL::hidden-channel-open");
    ctx.putImageData(img, 0, 0);
    setResult(extractLsbPayload(ctx.getImageData(0, 0, 64, 64).data));
    setNote("Synthetic carrier forged and re-extracted in-memory.");
  };

  return (
    <Panel icon={ImageIcon} title="Steganographic Payload Extractor" tag="lsb rgba">
      <div className="flex flex-wrap gap-2">
        <ActionButton variant="primary" onClick={() => fileRef.current?.click()}>
          Load Image
        </ActionButton>
        <ActionButton variant="ghost" onClick={forgeCarrier}>
          Forge Test Carrier
        </ActionButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
      {note && <p className="mt-2 text-[11px] text-accent">{note}</p>}
      {result && (
        <div className="mt-3 space-y-1">
          <Row label="payload" value={result.found ? "detected" : "none"} />
          <Row label="bits scanned" value={result.bitsScanned.toLocaleString()} />
          <Row label="lsb entropy" value={String(result.entropy)} />
          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-border/60 bg-background/70 p-2 font-mono text-[11px] text-primary">
            {result.message}
          </pre>
        </div>
      )}
    </Panel>
  );
}

function HoneypotTool() {
  const setPanic = useSystemStore((s) => s.setPanic);
  const pushLog = useSystemStore((s) => s.pushLog);
  return (
    <Panel icon={EyeOff} title="Decoy Honeypot Workspace" tag="panic cloak">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Arms the decoy layer: the entire OS is replaced by a benign search surface. Press{" "}
        <span className="text-accent">Esc</span> to restore the rogue console.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          variant="primary"
          onClick={() => {
            pushLog("[SEC] honeypot decoy engaged — session cloaked");
            setPanic(true);
          }}
        >
          Trigger Decoy
        </ActionButton>
        <ActionButton
          variant="ghost"
          onClick={() => pushLog("[SEC] honeypot trap logged a probe from 10.0.0.66")}
        >
          Log Fake Probe
        </ActionButton>
      </div>
    </Panel>
  );
}

export function ForensicsDeck() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SubnetTool />
      <HashTool />
      <JwtTool />
      <PortTool />
      <CodecTool />
      <StegoTool />
      <HoneypotTool />
    </div>
  );
}