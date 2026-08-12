import { useCallback, useEffect, useRef, useState } from "react";
import {
  GRAPH_NODES,
  TOTAL_BRANCHES,
  buildAmbiguityOptions,
  goldenAnswer,
  isAmbiguous,
  makeBranches,
  makeCitations,
  makeLogicSteps,
  makePurged,
  makeVotes,
} from "@/lib/accuracyEngine";
import type { EngineState, ModelId } from "@/types/accuracy";

const INITIAL: EngineState = {
  stage: "idle",
  prompt: "",
  activeModel: "deepseek",
  branches: [],
  simulated: 0,
  confidence: 0,
  drift: 4,
  citations: [],
  logic: [],
  purged: [],
  votes: [],
  golden: null,
  ambiguityOptions: [],
};

export function useAccuracyEngine() {
  const [state, setState] = useState<EngineState>(INITIAL);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const setModel = useCallback((activeModel: ModelId) => {
    setState((s) => ({ ...s, activeModel }));
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...INITIAL, activeModel: s.activeModel, prompt: s.prompt }));
  }, [clearTimers]);

  const setPrompt = useCallback((prompt: string) => {
    setState((s) => ({ ...s, prompt }));
  }, []);

  const toggleCitation = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      citations: s.citations.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c)),
    }));
  }, []);

  const run = useCallback(
    (rawPrompt: string, force = false) => {
      clearTimers();
      const prompt = rawPrompt.trim();
      if (!prompt) return;

      if (!force && isAmbiguous(prompt)) {
        setState((s) => ({
          ...INITIAL,
          activeModel: s.activeModel,
          prompt,
          stage: "ambiguity",
          ambiguityOptions: buildAmbiguityOptions(prompt),
        }));
        return;
      }

      const model = state.activeModel;
      const speed = model === "groq" ? 0.45 : model === "claude" ? 0.8 : 1;

      setState((s) => ({
        ...INITIAL,
        activeModel: s.activeModel,
        prompt,
        stage: "simulating",
        branches: makeBranches(GRAPH_NODES),
        logic: makeLogicSteps(prompt),
        citations: makeCitations(),
      }));

      // Monte-Carlo branch counter
      const ticks = 20;
      for (let i = 1; i <= ticks; i += 1) {
        later(
          () =>
            setState((s) => ({
              ...s,
              simulated: Math.round((TOTAL_BRANCHES / ticks) * i),
              confidence: Math.min(74, Math.round((74 / ticks) * i)),
              drift: 4 + Math.round(Math.sin(i) * 3 + i * 0.4),
              branches: i % 4 === 0 ? makeBranches(GRAPH_NODES, i * 3) : s.branches,
            })),
          i * 90 * speed,
        );
      }

      const simEnd = ticks * 90 * speed;

      later(() => {
        setState((s) => ({ ...s, stage: "guardrail", purged: makePurged() }));
      }, simEnd + 120);

      later(() => {
        setState((s) => ({
          ...s,
          stage: "verifying",
          citations: s.citations.map((c) => ({ ...c, verified: c.trust > 0.86 })),
        }));
      }, simEnd + 500 * speed);

      makeLogicSteps(prompt).forEach((step, idx) => {
        later(
          () =>
            setState((s) => ({
              ...s,
              logic: s.logic.map((l) =>
                l.id === step.id ? { ...l, status: idx === 4 ? "failed" : "passed" } : l,
              ),
              confidence: Math.min(96, s.confidence + 3),
            })),
          simEnd + (600 + idx * 220) * speed,
        );
      });

      later(() => {
        setState((s) => ({ ...s, stage: "consensus", votes: makeVotes(prompt) }));
      }, simEnd + 2000 * speed);

      later(() => {
        setState((s) => {
          const confidence = Math.max(88, Math.min(99, s.confidence + 4));
          return {
            ...s,
            stage: "done",
            confidence,
            drift: 6,
            golden: goldenAnswer(prompt, confidence, s.activeModel),
          };
        });
      }, simEnd + 2600 * speed);
    },
    [clearTimers, later, state.activeModel],
  );

  return { state, run, reset, setModel, setPrompt, toggleCitation };
}
