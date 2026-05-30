"use client";

import { SparklesCore } from "@/components/ui/sparkles";
import { useEffect, useState } from "react";

export default function AnimatedHeroBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 640px)");

    const update = () => {
      setReduceMotion(mqMotion.matches);
      setIsMobile(mqMobile.matches);
    };
    update();
    mqMotion.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqMotion.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="hero-bg" aria-hidden>
      <div className="hero-bg-gradient" />
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />
      <div className="hero-bg-orb hero-bg-orb-3" />

      <div className="hero-ball hero-ball-1" />
      <div className="hero-ball hero-ball-2" />
      <div className="hero-ball hero-ball-3" />
      <div className="hero-ball hero-ball-4" />
      <div className="hero-ball hero-ball-5" />

      <div className="hero-bg-shine" />
      <div className="hero-bg-grid" />

      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-[2]">
          <SparklesCore
            id="nayan-hero-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={isMobile ? 1 : 1.4}
            particleDensity={isMobile ? 60 : 100}
            className="h-full w-full"
            particleColor="#FFFFFF"
            speed={1}
          />
        </div>
      )}
    </div>
  );
}
