export type ModuleId =
  | "dashboard"
  | "accuracy"
  | "autocoder"
  | "voice"
  | "security"
  | "multimodal"
  | "biometrics"
  | "transhuman"
  | "diagnostics"
  | "protocols";

export interface Telemetry {
  fps: number;
  cpu: number;
  ram: number;
  latency: number;
}

export interface BatteryState {
  supported: boolean;
  level: number;
  charging: boolean;
}

export interface BrowserCapabilities {
  webgpu: boolean;
  webrtc: boolean;
  websockets: boolean;
  speech: boolean;
  battery: boolean;
  canvas: boolean;
  ready: boolean;
}

export interface SystemCommand {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}