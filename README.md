# Rogue OS Core

Project Name: DEVIL

App Title: DEVIL - Ultimate Autonomous Rogue AI Operating System

Vibe: Rogue AI, Unstoppable Power, Dark/Rebellious, Elite Hacker Aesthetic

UI Theme: Pitch Black Background (#030005), Glowing Crimson (#FF0033) & Electric Neon Purple (#9D00FF) Accents with Cyber-Glassmorphism HUD.



Build PART 1 (Core Shell, System Architecture & Fallback Engine) using Vite + React (TypeScript) + Tailwind CSS + Lucide Icons + Zustand:



1. ARCHITECTURE & DEPLOYMENT PREP:

   - Modular folder structure (`src/components`, `src/hooks`, `src/types`, `src/store`).

   - SPA routing configurations: Include `netlify.toml` and `public/_redirects` (`/* /index.html 200`).

   - Browser API Fallback Guard (`useBrowserCapabilities.ts`): Include polyfills/checks for WebGPU, WebRTC, WebSockets, SpeechRecognition, and Battery API to prevent crashes on unsupported devices.



2. CORE UI & TELEMETRY HUD HEADER:

   - Background: Pitch Black (#030005) with Cyber-Glassmorphism HUD panels. Glowing Crimson (#FF0033) and Electric Neon Purple (#9D00FF) borders/accents.

   - Top Header Telemetry Bar:

     * Dynamic FPS Counter (via requestAnimationFrame delta).

     * Resource Monitor: Simulated CPU/RAM usage bar, network latency (ms).

     * Battery HUD (via Battery API with mock fallbacks).

     * Emergency Panic Button (Esc Key or UI Click): Instantly switches screen to a benign Google Search UI overlay.

   - Background Canvas: Toggleable Matrix Digital Code Rain effect in Crimson/Purple (#FF0033/#9D00FF).

   - Command Palette (Ctrl+K): Spotlight-style search modal for system commands.



3. SIDEBAR NAVIGATION:

   - Sidebar links with glowing hover states and Lucide icons:

     * Dashboard / Matrix Overview

     * Category 1: Zero-Hallucination & Accuracy Engine

     * Category 2: Auto-Coder & Web Worker Sandbox

     * Category 3: Voice Mode & Mobile Action Bridge

     * Category 4 & 13: Cybersecurity, WAF & Vault

     * Category 5: Multimodal, OCR & File Suite

     * Category 6 & 10: Biometrics & Stealth Dual-UI

     * Category 7: Transhumanist Engine & Quantum Visualizers

     * Category 8 & 22: Productivity, Diagnostics & Thermals

     * Category 9 & 23: Gamified Rogue Protocols & Hotkeys



Ensure zero missing imports, valid Lucide icon references, and clean Vite compilation.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rogue-core-matrix.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d24af584-d722-4ada-874d-ca437f956509).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
