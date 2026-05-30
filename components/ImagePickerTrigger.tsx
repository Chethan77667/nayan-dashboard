"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ImagePickerTriggerProps = {
  onFile: (file: File) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Opens the gallery via a real button click. The file input is portaled to
 * document.body so Android Chrome is not blocked by overflow:hidden ancestors.
 */
export default function ImagePickerTrigger({
  onFile,
  children,
  className,
  "aria-label": ariaLabel,
}: ImagePickerTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const openPicker = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // showPicker unsupported or not allowed
    }
    input.click();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  const fileInput =
    mounted &&
    createPortal(
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden
        onChange={handleChange}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          opacity: 0,
          overflow: "hidden",
        }}
      />,
      document.body
    );

  return (
    <>
      {fileInput}
      <button type="button" onClick={openPicker} className={className} aria-label={ariaLabel}>
        {children}
      </button>
    </>
  );
}
