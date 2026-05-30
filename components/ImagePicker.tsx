"use client";

import { useId } from "react";

type ImagePickerProps = {
  onFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
};

/**
 * Mobile-safe file picker: uses <label htmlFor> so iOS/Android open gallery reliably.
 */
export default function ImagePicker({
  onFile,
  accept = "image/*",
  disabled,
  id: idProp,
  className,
  labelClassName,
  children,
}: ImagePickerProps) {
  const autoId = useId();
  const inputId = idProp ?? `img-picker-${autoId.replace(/:/g, "")}`;

  return (
    <div className={className}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={inputId}
        className={
          labelClassName ??
          "inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-indigo-100 px-4 py-3 text-sm font-bold text-indigo-900 active:scale-[0.98] touch-manipulation"
        }
      >
        {children}
      </label>
    </div>
  );
}
