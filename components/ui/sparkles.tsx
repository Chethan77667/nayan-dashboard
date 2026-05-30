"use client";

import { useEffect, useId } from "react";
import {
  Particles,
  ParticlesProvider,
  useParticlesProvider,
} from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

async function initParticles(engine: Engine) {
  await loadSlim(engine);
}

function SparklesCanvas({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps) {
  const controls = useAnimation();
  const generatedId = useId();
  const { loaded } = useParticlesProvider();

  useEffect(() => {
    if (loaded) {
      void controls.start({
        opacity: 1,
        transition: { duration: 1 },
      });
    }
  }, [loaded, controls]);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      await controls.start({
        opacity: 1,
        transition: { duration: 1 },
      });
    }
  };

  if (!loaded) return null;

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      <Particles
        id={id || generatedId}
        className="h-full w-full"
        particlesLoaded={particlesLoaded}
        options={{
          background: {
            color: { value: background || "transparent" },
          },
          fullScreen: {
            enable: false,
            zIndex: 1,
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: false, mode: "repulse" },
              resize: { enable: true },
            },
            modes: {
              push: { quantity: 4 },
              repulse: { distance: 200, duration: 0.4 },
            },
          },
          particles: {
            color: { value: particleColor || "#ffffff" },
            collisions: { enable: false },
            move: {
              enable: true,
              direction: "none",
              outModes: { default: "out" },
              speed: { min: 0.1, max: 1 },
            },
            number: {
              density: { enable: true, width: 400, height: 400 },
              value: particleDensity || 120,
            },
            opacity: {
              value: { min: 0.1, max: 1 },
              animation: {
                enable: true,
                speed: speed || 4,
                sync: false,
                mode: "auto",
                startValue: "random",
              },
            },
            shape: { type: "circle" },
            size: {
              value: { min: minSize || 1, max: maxSize || 3 },
            },
          },
          detectRetina: true,
        }}
      />
    </motion.div>
  );
}

export function SparklesCore(props: ParticlesProps) {
  return (
    <ParticlesProvider init={initParticles}>
      <SparklesCanvas {...props} />
    </ParticlesProvider>
  );
}
