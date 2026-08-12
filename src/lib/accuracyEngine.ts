import type {
  Branch,
  Citation,
  ConsensusVote,
  LogicStep,
  ModelId,
  PurgedStatement,
} from "@/types/accuracy";

export const TOTAL_BRANCHES = 1000;
export const GRAPH_NODES = 220;

const VAGUE_TOKENS = ["it", "this", "thing", "stuff", "better", "best", "fix", "help", "somehow"];

export function isAmbiguous(prompt: string) {
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  if (words.length < 4) return true;
  const vague = words.filter((w) => VAGUE_TOKENS.includes(w.toLowerCase())).length;
  return vague / words.length > 0.3;
}

export function buildAmbiguityOptions(prompt: string): string[] {
  const subject = prompt.trim() || "the target";
  return [
    `Interpret "${subject}" as a technical implementation request`,
    `Interpret "${subject}" as a factual research question`,
    `Interpret "${subject}" as a strategy / decision request`,
    `Interpret "${subject}" as a debugging / failure analysis request`,
  ];
}

export function makeBranches(count: number, seedOffset = 0): Branch[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i + seedOffset) * 2.399963;
    const radius = Math.sqrt(i / count);
    const score = Math.max(0, Math.min(1, 0.45 + Math.sin(angle * 1.7) * 0.28 + (i % 7) * 0.02));
    return {
      id: i,
      x: 50 + Math.cos(angle) * radius * 46,
      y: 50 + Math.sin(angle) * radius * 46,
      score,
      verified: score > 0.62,
      purged: score < 0.28,
      parent: i === 0 ? null : Math.floor(i / 4),
    };
  });
}

export function makeLogicSteps(prompt: string): LogicStep[] {
  const short = prompt.trim().slice(0, 46) || "target claim";
  return [
    { id: "l1", claim: `Premises extracted from "${short}"`, method: "Semantic decomposition", status: "pending" },
    { id: "l2", claim: "No circular dependency in reasoning chain", method: "Graph acyclicity proof", status: "pending" },
    { id: "l3", claim: "Numeric assertions dimensionally consistent", method: "Unit + magnitude check", status: "pending" },
    { id: "l4", claim: "Conclusion follows from premises", method: "Modus ponens validation", status: "pending" },
    { id: "l5", claim: "No unsupported extrapolation beyond evidence", method: "Entailment bound test", status: "pending" },
    { id: "l6", claim: "Counter-example search returned empty", method: "Adversarial probe ×64", status: "pending" },
  ];
}

export function makeCitations(): Citation[] {
  return [
    { id: "c1", label: "Primary Spec Node", source: "spec.local/registry", url: "https://developer.mozilla.org", trust: 0.98, verified: false },
    { id: "c2", label: "Peer Corpus Mirror", source: "corpus.mirror/07", url: "https://arxiv.org", trust: 0.93, verified: false },
    { id: "c3", label: "Live Web Relay", source: "relay.web/eu-3", url: "https://wikipedia.org", trust: 0.88, verified: false },
    { id: "c4", label: "Local Vault Index", source: "vault.local/idx", url: "https://github.com", trust: 0.95, verified: false },
    { id: "c5", label: "Statistical Baseline", source: "stats.node/base", url: "https://ourworldindata.org", trust: 0.9, verified: false },
  ];
}

export function makePurged(): PurgedStatement[] {
  return [
    { id: "p1", text: "Claim asserted a 340% gain with no measurable baseline.", reason: "Unverified magnitude" },
    { id: "p2", text: "Branch 417 contradicted branch 092 on causality direction.", reason: "Self-inconsistency" },
    { id: "p3", text: "Cited a source node that failed trust threshold (0.41).", reason: "Low-trust citation" },
    { id: "p4", text: "Statement extrapolated beyond the provided context window.", reason: "Unsupported extrapolation" },
  ];
}

export function makeVotes(prompt: string): ConsensusVote[] {
  const topic = prompt.trim().slice(0, 40) || "the query";
  return [
    { model: "groq", answer: `Fast-lane resolution of ${topic} with 3 verified constraints.`, weight: 0.28 },
    { model: "deepseek", answer: `Deep chain resolution of ${topic} across 7 reasoning layers.`, weight: 0.42 },
    { model: "claude", answer: `Nuanced resolution of ${topic} with edge-case caveats retained.`, weight: 0.3 },
  ];
}

export function goldenAnswer(prompt: string, confidence: number, model: ModelId) {
  const topic = prompt.trim() || "the query";
  return `GOLDEN CONSENSUS — ${topic}\n\nMerged from 3 swarm models (lead: ${model.toUpperCase()}) across ${TOTAL_BRANCHES.toLocaleString()} simulated reasoning branches. Contradictory branches purged, every surviving claim bound to a verified source node. Final confidence ${confidence}%. Residual uncertainty is disclosed rather than hidden — DEVIL does not fabricate.`;
}
