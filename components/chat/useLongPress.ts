import { useCallback, useRef } from "react";

const DEFAULT_MS = 550;

export function useLongPress(
  onLongPress: () => void,
  { delay = DEFAULT_MS }: { delay?: number } = {}
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    firedRef.current = false;
    clear();
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  }, [clear, delay, onLongPress]);

  const end = useCallback(() => {
    clear();
  }, [clear]);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length > 1) return;
      start();
    },
    onTouchEnd: end,
    onTouchMove: end,
    onTouchCancel: end,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      if (!firedRef.current) {
        firedRef.current = true;
        onLongPress();
      }
    },
  };

  return { handlers, firedRef };
}
