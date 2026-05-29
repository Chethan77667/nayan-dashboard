"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.2,
        syncTouch: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
