import {
  Binary,
  Bot,
  Code2,
  Fingerprint,
  Gauge,
  LayoutDashboard,
  Mic,
  ScanText,
  ShieldHalf,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  tag: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Matrix Overview", tag: "Dashboard", icon: LayoutDashboard },
  { to: "/accuracy", label: "Zero-Hallucination Engine", tag: "CAT 01", icon: Bot },
  { to: "/autocoder", label: "Auto-Coder & Worker Sandbox", tag: "CAT 02", icon: Code2 },
  { to: "/voice", label: "Voice Mode & Mobile Bridge", tag: "CAT 03", icon: Mic },
  { to: "/security", label: "Cybersecurity, WAF & Vault", tag: "CAT 04/13", icon: ShieldHalf },
  { to: "/multimodal", label: "Multimodal, OCR & Files", tag: "CAT 05", icon: ScanText },
  { to: "/biometrics", label: "Biometrics & Stealth Dual-UI", tag: "CAT 06/10", icon: Fingerprint },
  { to: "/transhuman", label: "Transhumanist & Quantum", tag: "CAT 07", icon: Binary },
  { to: "/diagnostics", label: "Productivity & Thermals", tag: "CAT 08/22", icon: Gauge },
  { to: "/protocols", label: "Rogue Protocols & Hotkeys", tag: "CAT 09/23", icon: Trophy },
];