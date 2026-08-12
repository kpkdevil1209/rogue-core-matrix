import { useEffect, useState } from "react";
import type { BrowserCapabilities } from "@/types/system";

const FALLBACK: BrowserCapabilities = {
  webgpu: false,
  webrtc: false,
  websockets: false,
  speech: false,
  battery: false,
  canvas: false,
  ready: false,
};

/**
 * Guards every optional browser API behind a feature check so unsupported
 * devices degrade instead of crashing. Only runs after hydration.
 */
export function useBrowserCapabilities(): BrowserCapabilities {
  const [caps, setCaps] = useState<BrowserCapabilities>(FALLBACK);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    const nav = navigator as unknown as Record<string, unknown>;

    let canvas = false;
    try {
      canvas = !!document.createElement("canvas").getContext("2d");
    } catch {
      canvas = false;
    }

    setCaps({
      webgpu: typeof nav["gpu"] === "object" && nav["gpu"] !== null,
      webrtc: typeof w["RTCPeerConnection"] === "function",
      websockets: typeof w["WebSocket"] === "function",
      speech:
        typeof w["SpeechRecognition"] === "function" ||
        typeof w["webkitSpeechRecognition"] === "function",
      battery: typeof nav["getBattery"] === "function",
      canvas,
      ready: true,
    });
  }, []);

  return caps;
}