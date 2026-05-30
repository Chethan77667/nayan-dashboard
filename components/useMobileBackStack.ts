"use client";

import { useCallback, useEffect, useRef } from "react";

type StackEntry = { id: string; onBack: () => void };

let stack: StackEntry[] = [];
let listenerReady = false;
let skipNextPop = false;

function ensurePopListener() {
  if (listenerReady) return;
  listenerReady = true;
  window.addEventListener("popstate", () => {
    if (skipNextPop) {
      skipNextPop = false;
      return;
    }
    const entry = stack.pop();
    entry?.onBack();
  });
}

/** Push a history entry so Android/iOS back closes this layer first. */
export function useMobileBackStack(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const idRef = useRef(`back-${Math.random().toString(36).slice(2)}`);
  const activeRef = useRef(false);

  useEffect(() => {
    ensurePopListener();
    const id = idRef.current;

    if (!active) {
      if (activeRef.current) {
        stack = stack.filter((e) => e.id !== id);
        activeRef.current = false;
      }
      return;
    }

    if (!activeRef.current) {
      history.pushState({ mobileBackStack: id }, "");
      stack.push({ id, onBack: () => onBackRef.current() });
      activeRef.current = true;
    }

    return () => {
      if (activeRef.current) {
        stack = stack.filter((e) => e.id !== id);
        activeRef.current = false;
      }
    };
  }, [active]);

  const dismiss = useCallback(() => {
    const id = idRef.current;
    if (activeRef.current) {
      activeRef.current = false;
      stack = stack.filter((e) => e.id !== id);
      skipNextPop = true;
      history.back();
    }
    onBackRef.current();
  }, []);

  return dismiss;
}
