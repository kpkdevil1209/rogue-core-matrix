import { useMemo, useState } from "react";
import {
  Boxes,
  Container,
  Database,
  FileCode2,
  GitBranch,
  Regex,
  Sparkles,
  TestTube2,
  Wrench,
} from "lucide-react";
import { ActionButton, CodeBlock, Field, Panel } from "./Panel";

export function ToolDeck() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ReversePrompt />
      <MermaidStudio />
      <AutoDocs />
      <DepResolver />
      <QueryStudio />
      <RegexDebugger />
      <DevOpsBuilder />
      <RefactorEngine />
      <TestGenerator />
    </div>
  );
}

/* 15 — Reverse Prompt Engineering */
function ReversePrompt() {
  const [code, setCode] = useState("export function Hero(){return <section className='grid gap-4'/>}");
  const prompt = useMemo(() => {
    const tokens = code.match(/[A-Z][a-zA-Z]+/g) ?? [];
    const jsx = /<[a-zA-Z]/.test(code);
    const hooks = code.match(/use[A-Z]\w+/g) ?? [];
    return [
      `Build a ${jsx ? "React component" : "module"} named ${tokens[0] ?? "Module"}.`,
      hooks.length ? `Wire state through ${[...new Set(hooks)].join(", ")}.` : "Keep it stateless and pure.",
      `Detected entities: ${[...new Set(tokens)].slice(0, 6).join(", ") || "none"}.`,
      `Style with Tailwind utility classes; ${code.includes("grid") ? "grid layout" : "flow layout"}.`,
      "Return production-ready TypeScript with no placeholder content.",
    ].join("\n");
  }, [code]);
  return (
    <Panel icon={Sparkles} title="Reverse Prompt Engineering" tag="feat 15">
      <Field label="Source artifact" value={code} onChange={setCode} rows={5} />
      <div className="mt-3">
        <CodeBlock>{prompt}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 16 — Mermaid flowchart generator */
function MermaidStudio() {
  const [steps, setSteps] = useState("intake\nvalidate\nsimulate\nverify\ndeploy");
  const nodes = steps.split("\n").map((s) => s.trim()).filter(Boolean);
  const mermaid = ["flowchart TD", ...nodes.map((n, i) => (i < nodes.length - 1 ? `  n${i}[${n}] --> n${i + 1}[${nodes[i + 1]}]` : null)).filter(Boolean)].join("\n");
  return (
    <Panel icon={GitBranch} title="Live Flowchart Generator" tag="feat 16">
      <Field label="Pipeline steps" value={steps} onChange={setSteps} rows={5} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <CodeBlock>{mermaid}</CodeBlock>
        <svg viewBox={`0 0 200 ${nodes.length * 46}`} className="w-full rounded border border-border/60 bg-background/70">
          {nodes.map((n, i) => (
            <g key={i}>
              {i > 0 && <line x1="100" y1={i * 46 - 12} x2="100" y2={i * 46 + 4} stroke="#9d00ff" strokeWidth="1" />}
              <rect x="30" y={i * 46 + 6} width="140" height="26" rx="4" fill="#ff003318" stroke="#ff0033" strokeWidth="1" />
              <text x="100" y={i * 46 + 23} textAnchor="middle" fontSize="10" fill="#ff5577">{n}</text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  );
}

/* 17 — Auto documentation */
function AutoDocs() {
  const [src, setSrc] = useState("export function compileArtifact(kind, code) {\n  return build(kind, code);\n}");
  const docs = useMemo(() => {
    const fns = [...src.matchAll(/function\s+(\w+)\s*\(([^)]*)\)/g)];
    if (fns.length === 0) return "No exported functions detected.";
    return fns
      .map(
        ([, name, args]) =>
          `### \`${name}()\`\n\n| Param | Type |\n| --- | --- |\n${(args || "")
            .split(",")
            .filter((a) => a.trim())
            .map((a) => `| ${a.trim()} | inferred |`)
            .join("\n") || "| — | — |"}\n\nAuto-generated from AST signature.`,
      )
      .join("\n\n");
  }, [src]);
  return (
    <Panel icon={FileCode2} title="Auto-Documentation Engine" tag="feat 17">
      <Field label="Module source" value={src} onChange={setSrc} rows={5} />
      <div className="mt-3">
        <CodeBlock>{docs}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 18 — NPM dependency auto-resolver */
const REGISTRY: Record<string, { version: string; size: string; peers: string[] }> = {
  react: { version: "18.3.1", size: "6.4 kB", peers: [] },
  "react-dom": { version: "18.3.1", size: "130 kB", peers: ["react"] },
  three: { version: "0.160.0", size: "612 kB", peers: [] },
  zustand: { version: "5.0.2", size: "3.1 kB", peers: ["react"] },
  zod: { version: "3.24.1", size: "57 kB", peers: [] },
};
function DepResolver() {
  const [input, setInput] = useState("react-dom, three, zustand");
  const requested = input.split(",").map((s) => s.trim()).filter(Boolean);
  const resolved = new Set<string>();
  requested.forEach((r) => {
    resolved.add(r);
    REGISTRY[r]?.peers.forEach((p) => resolved.add(p));
  });
  return (
    <Panel icon={Boxes} title="NPM Dependency Auto-Resolver" tag="feat 18">
      <Field label="Requested packages" value={input} onChange={setInput} />
      <div className="mt-3 space-y-1.5">
        {[...resolved].map((name) => {
          const meta = REGISTRY[name];
          return (
            <div key={name} className="flex items-center justify-between rounded border border-border/60 bg-background/60 px-2.5 py-1.5 text-[11px]">
              <span className="font-mono text-accent">{name}</span>
              <span className="text-muted-foreground">
                {meta ? `${meta.version} · ${meta.size}` : "unknown — flagged for audit"}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* 19 — SQL / NoSQL query studio */
function QueryStudio() {
  const [mode, setMode] = useState<"sql" | "nosql">("sql");
  const [q, setQ] = useState("select id, role from agents where progress = 100");
  const out = useMemo(() => {
    if (mode === "sql") {
      const cols = /select (.+?) from/i.exec(q)?.[1]?.split(",").map((c) => c.trim()) ?? ["*"];
      return JSON.stringify(
        Array.from({ length: 3 }, (_, i) =>
          Object.fromEntries(cols.map((c) => [c, c === "id" ? i + 1 : `${c}-${i + 1}`])),
        ),
        null,
        2,
      );
    }
    return JSON.stringify({ pipeline: [{ $match: { progress: 100 } }, { $project: { id: 1, role: 1 } }], matched: 3 }, null, 2);
  }, [mode, q]);
  return (
    <Panel icon={Database} title="SQL / NoSQL Query Studio" tag="feat 19">
      <div className="mb-2 flex gap-2">
        {(["sql", "nosql"] as const).map((m) => (
          <ActionButton key={m} onClick={() => setMode(m)} variant={mode === m ? "accent" : "ghost"}>
            {m.toUpperCase()}
          </ActionButton>
        ))}
      </div>
      <Field label="Query" value={q} onChange={setQ} rows={3} />
      <div className="mt-3">
        <CodeBlock>{out}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 20 — Regex live debugger */
function RegexDebugger() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+)\\.dev");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("root@devil.dev / ghost@shadow.dev");
  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
      return { matches: [...text.matchAll(re)].map((m) => ({ match: m[0], groups: m.slice(1), index: m.index })), error: null as string | null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, text]);
  return (
    <Panel icon={Regex} title="Regex Live Debugger" tag="feat 20">
      <div className="grid gap-2 sm:grid-cols-[3fr_1fr]">
        <Field label="Pattern" value={pattern} onChange={setPattern} />
        <Field label="Flags" value={flags} onChange={setFlags} />
      </div>
      <div className="mt-2">
        <Field label="Test subject" value={text} onChange={setText} rows={2} />
      </div>
      <div className="mt-3">
        <CodeBlock>{result.error ? `INVALID PATTERN → ${result.error}` : JSON.stringify(result.matches, null, 2)}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 21/22 — Dockerfile + CI/CD builder */
function DevOpsBuilder() {
  const [node, setNode] = useState("20");
  const [cmd, setCmd] = useState("bun run build");
  const dockerfile = `FROM node:${node}-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN ${cmd}\nEXPOSE 8080\nCMD ["npm","start"]`;
  const ci = `name: devil-pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: "${node}" }\n      - run: npm ci\n      - run: ${cmd}`;
  return (
    <Panel icon={Container} title="Dockerfile / CI-CD Builder" tag="feat 21 · 22">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Node version" value={node} onChange={setNode} />
        <Field label="Build command" value={cmd} onChange={setCmd} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <CodeBlock>{dockerfile}</CodeBlock>
        <CodeBlock>{ci}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 24 — Refactoring engine */
function RefactorEngine() {
  const [src, setSrc] = useState("var total = 0;\nfor (var i = 0; i < items.length; i++) { total = total + items[i].price; }");
  const refactored = useMemo(() => {
    let out = src.replace(/\bvar\b/g, "const");
    out = out.replace(
      /const (\w+) = 0;\s*for \(const \w+ = 0; \w+ < (\w+)\.length; \w+\+\+\) \{[\s\S]*?\}/,
      (_m, name, arr) => `const ${name} = ${arr}.reduce((acc, item) => acc + item.price, 0);`,
    );
    return out.replace(/ == /g, " === ");
  }, [src]);
  return (
    <Panel icon={Wrench} title="Code Refactoring Engine" tag="feat 24">
      <Field label="Legacy source" value={src} onChange={setSrc} rows={4} />
      <div className="mt-3">
        <CodeBlock>{refactored}</CodeBlock>
      </div>
    </Panel>
  );
}

/* 25 — Unit test suite generator */
function TestGenerator() {
  const [src, setSrc] = useState("export function sum(a, b) { return a + b }");
  const suite = useMemo(() => {
    const fns = [...src.matchAll(/function\s+(\w+)\s*\(([^)]*)\)/g)];
    if (fns.length === 0) return "// no functions detected";
    return `import { describe, expect, it } from "vitest";\n\n${fns
      .map(([, name, args]) => {
        const params = (args || "").split(",").map((a) => a.trim()).filter(Boolean);
        const call = `${name}(${params.map((_, i) => i + 1).join(", ")})`;
        return `describe("${name}", () => {\n  it("returns a defined result for valid input", () => {\n    expect(${call}).toBeDefined();\n  });\n\n  it("is deterministic across repeat calls", () => {\n    expect(${call}).toEqual(${call});\n  });\n});`;
      })
      .join("\n\n")}`;
  }, [src]);
  return (
    <Panel icon={TestTube2} title="Unit Test Suite Auto-Generator" tag="feat 25">
      <Field label="Target module" value={src} onChange={setSrc} rows={4} />
      <div className="mt-3">
        <CodeBlock>{suite}</CodeBlock>
      </div>
    </Panel>
  );
}
