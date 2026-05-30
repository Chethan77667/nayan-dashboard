"use client";

import { useEffect } from "react";

const NOISE = ["[HMR]", "[Fast Refresh]", "forward-logs-shared"];

function isNextDevNoise(args: unknown[]) {
  const text = args.map((a) => String(a)).join(" ");
  return NOISE.some((n) => text.includes(n));
}

/**
 * Quiets repetitive Next.js dev/HMR messages in the browser console.
 */
export default function SuppressNextDevConsole() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const origLog = console.log.bind(console);
    const origInfo = console.info.bind(console);
    const origDebug = console.debug.bind(console);

    console.log = (...args: unknown[]) => {
      if (isNextDevNoise(args)) return;
      origLog(...args);
    };
    console.info = (...args: unknown[]) => {
      if (isNextDevNoise(args)) return;
      origInfo(...args);
    };
    console.debug = (...args: unknown[]) => {
      if (isNextDevNoise(args)) return;
      origDebug(...args);
    };

    return () => {
      console.log = origLog;
      console.info = origInfo;
      console.debug = origDebug;
    };
  }, []);

  return null;
}
