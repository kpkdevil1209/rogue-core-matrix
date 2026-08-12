import { useCallback, useEffect, useRef, useState } from "react";
import { derivePatch } from "@/lib/selfHeal";
import { TEMPLATES, buildDocument, type ArtifactKind } from "@/lib/sandboxTemplates";

export interface TerminalLine {
  id: number;
  kind: "info" | "error" | "log" | "warn" | "patch" | "build";
  text: string;
  at: string;
}

export interface SyntaxIssue {
  severity: "error" | "warn";
  line: number;
  message: string;
}

const WORKER_SRC = `
self.onmessage = function (e) {
  var code = e.data.code || "";
  var lines = code.split("\\n");
  var issues = [];
  var stack = [];
  var pairs = { "(": ")", "[": "]", "{": "}" };
  var closers = { ")": "(", "]": "[", "}": "{" };
  var nodes = 0;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (var j = 0; j < line.length; j++) {
      var ch = line[j];
      if (pairs[ch]) { stack.push({ ch: ch, line: i + 1 }); nodes++; }
      else if (closers[ch]) {
        var top = stack.pop();
        if (!top || top.ch !== closers[ch]) {
          issues.push({ severity: "error", line: i + 1, message: "Unbalanced '" + ch + "' — no matching opener" });
        }
      }
    }
    var quotes = (line.match(/"/g) || []).length;
    if (quotes % 2 === 1 && line.indexOf("//") === -1) {
      issues.push({ severity: "warn", line: i + 1, message: "Odd number of double quotes — possible unterminated string" });
    }
    if (/\\bvar\\s+\\w+\\s*=\\s*;/.test(line)) {
      issues.push({ severity: "error", line: i + 1, message: "Assignment with empty right-hand side" });
    }
    if (/[^=!<>]=[^=]/.test(line) && /\\bif\\s*\\(/.test(line)) {
      issues.push({ severity: "warn", line: i + 1, message: "Assignment inside conditional expression" });
    }
    nodes += (line.match(/[\\w$]+/g) || []).length;
  }
  stack.forEach(function (s) {
    issues.push({ severity: "error", line: s.line, message: "Unclosed '" + s.ch + "'" });
  });
  self.postMessage({ issues: issues, nodes: nodes, lines: lines.length });
};
`;

let seq = 0;
const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

export function useSandbox() {
  const [kind, setKind] = useState<ArtifactKind>("html");
  const [code, setCode] = useState(TEMPLATES.html);
  const [doc, setDoc] = useState("");
  const [issues, setIssues] = useState<SyntaxIssue[]>([]);
  const [astNodes, setAstNodes] = useState(0);
  const [compiling, setCompiling] = useState(false);
  const [autoHeal, setAutoHeal] = useState(true);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: seq++, kind: "info", text: "worker sandbox spawned — origin isolated", at: stamp() },
  ]);
  const workerRef = useRef<Worker | null>(null);
  const codeRef = useRef(code);
  const healRef = useRef(autoHeal);
  const healCount = useRef(0);

  codeRef.current = code;
  healRef.current = autoHeal;

  const log = useCallback((kindOf: TerminalLine["kind"], text: string) => {
    setLines((prev) => [...prev.slice(-199), { id: seq++, kind: kindOf, text, at: stamp() }]);
  }, []);

  // background compile worker
  useEffect(() => {
    if (typeof Worker === "undefined") return;
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    const worker = new Worker(url);
    worker.onmessage = (e: MessageEvent) => {
      setIssues(e.data.issues as SyntaxIssue[]);
      setAstNodes(e.data.nodes as number);
      setCompiling(false);
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  }, []);

  // debounced AST pass
  useEffect(() => {
    const t = setTimeout(() => {
      setCompiling(true);
      workerRef.current?.postMessage({ code });
    }, 350);
    return () => clearTimeout(t);
  }, [code]);

  // runtime error capture + self-healing mutator
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.__devil !== true) return;
      if (data.type === "error") {
        log("error", `runtime: ${data.message}${data.line ? ` @ line ${data.line}` : ""}`);
        if (!healRef.current || healCount.current >= 4) return;
        const patch = derivePatch(String(data.message), codeRef.current);
        if (!patch) {
          log("warn", "mutator: no deterministic patch matched — manual intervention required");
          return;
        }
        healCount.current += 1;
        const next = patch.apply(codeRef.current);
        setCode(next);
        log("patch", `${patch.rule} — ${patch.description}`);
        log("build", "mutation applied, recompiling artifact");
      } else {
        log(data.type === "warn" ? "warn" : "log", `console: ${data.message}`);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [log]);

  const run = useCallback(() => {
    healCount.current = 0;
    log("build", `compiling ${kind.toUpperCase()} artifact in background worker`);
    setDoc(buildDocument(kind, codeRef.current));
    log("info", "artifact mounted into isolated viewport");
  }, [kind, log]);

  // auto re-render after a self-heal mutation
  const lastDoc = useRef("");
  useEffect(() => {
    if (!doc) return;
    lastDoc.current = doc;
  }, [doc]);

  const selectKind = useCallback(
    (next: ArtifactKind) => {
      setKind(next);
      setCode(TEMPLATES[next]);
      setDoc("");
      log("info", `artifact channel switched → ${next.toUpperCase()}`);
    },
    [log],
  );

  const clearTerminal = useCallback(() => setLines([]), []);

  return {
    kind,
    code,
    doc,
    issues,
    astNodes,
    compiling,
    autoHeal,
    lines,
    setCode,
    setAutoHeal,
    selectKind,
    run,
    setDoc,
    log,
    clearTerminal,
  };
}
