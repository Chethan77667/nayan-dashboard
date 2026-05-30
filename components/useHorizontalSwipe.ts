"use client";

import { useCallback, useRef } from "react";

const MIN_DISTANCE = 56;
const MAX_VERTICAL = 72;

type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

export function useHorizontalSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const leftRef = useRef(onSwipeLeft);
  const rightRef = useRef(onSwipeRight);
  leftRef.current = onSwipeLeft;
  rightRef.current = onSwipeRight;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const origin = start.current;
    start.current = null;
    if (!origin) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;

    if (Math.abs(dy) > MAX_VERTICAL && Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < MIN_DISTANCE) return;

    if (dx < 0) leftRef.current?.();
    else rightRef.current?.();
  }, []);

  return { onTouchStart, onTouchEnd };
}
