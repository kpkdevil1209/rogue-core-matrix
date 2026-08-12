export type EngineStage =
  | "idle"
  | "ambiguity"
  | "simulating"
  | "guardrail"
  | "verifying"
  | "consensus"
  | "done";

export type ModelId = "groq" | "deepseek" | "claude";

export interface SwarmModel {
  id: ModelId;
  name: string;
  role: string;
  latencyMs: number;
  accuracy: number;
}

export interface Branch {
  id: number;
  x: number;
  y: number;
  score: number;
  verified: boolean;
  purged: boolean;
  parent: number | null;
}

export interface Citation {
  id: string;
  label: string;
  source: string;
  url: string;
  trust: number;
  verified: boolean;
}

export interface LogicStep {
  id: string;
  claim: string;
  method: string;
  status: "pending" | "passed" | "failed";
}

export interface PurgedStatement {
  id: string;
  text: string;
  reason: string;
}

export interface ConsensusVote {
  model: ModelId;
  answer: string;
  weight: number;
}

export interface EngineState {
  stage: EngineStage;
  prompt: string;
  activeModel: ModelId;
  branches: Branch[];
  simulated: number;
  confidence: number;
  drift: number;
  citations: Citation[];
  logic: LogicStep[];
  purged: PurgedStatement[];
  votes: ConsensusVote[];
  golden: string | null;
  ambiguityOptions: string[];
}

export const SWARM: SwarmModel[] = [
  { id: "groq", name: "Groq · Llama 3.3 70B", role: "Sub-100ms reflex lane", latencyMs: 78, accuracy: 93 },
  { id: "deepseek", name: "DeepSeek-R1", role: "Deep chain-of-thought reasoning", latencyMs: 2400, accuracy: 97 },
  { id: "claude", name: "Claude 3.5 Sonnet", role: "Nuance, safety & long context", latencyMs: 1100, accuracy: 96 },
];
