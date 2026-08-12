import { useEffect, useRef, useState } from "react";
import type { BatteryState, Telemetry } from "@/types/system";

export function useTelemetry(): Telemetry {
  const [telemetry, setTelemetry] = useState<Telemetry>({
    fps: 60,
    cpu: 34,
    ram: 48,
    latency: 18,
  });
  const frames = useRef(0);
  const last = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    last.current = performance.now();

    const loop = (now: number) => {
      frames.current += 1;
      const delta = now - last.current;
      if (delta >= 1000) {
        const fps = Math.round((frames.current * 1000) / delta);
        frames.current = 0;
        last.current = now;
        if (mounted) setTelemetry((prev) => ({ ...prev, fps }));
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const sim = window.setInterval(() => {
      if (!mounted) return;
      setTelemetry((prev) => ({
        ...prev,
        cpu: clamp(prev.cpu + rand(-7, 7), 12, 96),
        ram: clamp(prev.ram + rand(-4, 4), 22, 93),
        latency: clamp(prev.latency + rand(-6, 6), 4, 180),
      }));
    }, 1200);

    return () => {
      mounted = false;
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      window.clearInterval(sim);
    };
  }, []);

  return telemetry;
}

export function useBattery(supported: boolean): BatteryState {
  const [state, setState] = useState<BatteryState>({
    supported: false,
    level: 0.82,
    charging: false,
  });

  useEffect(() => {
    if (!supported) return;
    let mounted = true;
    let target: EventTarget | null = null;
    const sync = (b: { level: number; charging: boolean }) => {
      if (mounted) setState({ supported: true, level: b.level, charging: b.charging });
    };

    const getBattery = (
      navigator as unknown as {
        getBattery?: () => Promise<
          { level: number; charging: boolean } & EventTarget
        >;
      }
    ).getBattery;

    const handler = () => {
      if (target) sync(target as unknown as { level: number; charging: boolean });
    };

    getBattery?.()
      .then((b) => {
        target = b;
        sync(b);
        b.addEventListener("levelchange", handler);
        b.addEventListener("chargingchange", handler);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      target?.removeEventListener("levelchange", handler);
      target?.removeEventListener("chargingchange", handler);
    };
  }, [supported]);

  return state;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(v)));
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}