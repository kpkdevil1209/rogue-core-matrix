export interface Patch {
  rule: string;
  description: string;
  apply: (code: string) => string;
}

/** Derives an automatic mutation from a captured runtime error. */
export function derivePatch(message: string, code: string): Patch | null {
  const undef = /(\w[\w$]*) is not defined/.exec(message);
  if (undef && !new RegExp(`\\b(var|let|const|function)\\s+${undef[1]}\\b`).test(code)) {
    const name = undef[1];
    return {
      rule: "MUT-01 / MISSING_BINDING",
      description: `Injected safe stub binding for missing symbol "${name}"`,
      apply: (c) => `// [DEVIL self-heal] stub injected for ${name}\nvar ${name} = window.${name} || {};\n${c}`,
    };
  }

  const nullRead = /Cannot read propert(?:y|ies) of (?:null|undefined) \(reading '(\w+)'\)/.exec(message);
  if (nullRead) {
    const prop = nullRead[1];
    return {
      rule: "MUT-02 / NULL_GUARD",
      description: `Rewrote member access ".${prop}" to optional chaining`,
      apply: (c) => c.replace(new RegExp(`([\\w\\)\\]])\\.${prop}\\b`, "g"), `$1?.${prop}`),
    };
  }

  if (/is not a function/.test(message)) {
    const fn = /(\w[\w$.]*) is not a function/.exec(message)?.[1] ?? "target";
    return {
      rule: "MUT-03 / CALLABLE_GUARD",
      description: `Wrapped invocation of "${fn}" in a callable type guard`,
      apply: (c) =>
        `// [DEVIL self-heal] callable guard for ${fn}\n${c.replace(
          new RegExp(`${fn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\(`, "g"),
          `(typeof ${fn} === "function" ? ${fn} : function(){})(`,
        )}`,
    };
  }

  if (/getElementById\(|querySelector\(/.test(code) && /null/.test(message)) {
    return {
      rule: "MUT-04 / MOUNT_GUARD",
      description: "Injected mount-node fallback before DOM query",
      apply: (c) =>
        `// [DEVIL self-heal] guaranteed mount node\nif(!document.getElementById("root")){var _r=document.createElement("div");_r.id="root";document.body.appendChild(_r);}\n${c}`,
    };
  }

  return null;
}
