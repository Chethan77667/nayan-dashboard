"use client";

type MobileFileInputProps = {
  id: string;
  onFile: (file: File) => void;
  label?: string;
  className?: string;
};

/**
 * Full-area tap target for gallery on iOS/Android (avoid sr-only / file: pseudo).
 */
export default function MobileFileInput({
  id,
  onFile,
  label = "Choose photo from gallery",
  className,
}: MobileFileInputProps) {
  return (
    <label
      htmlFor={id}
      className={
        className ??
        "relative mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 touch-manipulation active:bg-indigo-100"
      }
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-[0.01]"
        style={{ fontSize: 16 }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <span className="pointer-events-none text-center text-sm font-bold text-indigo-900">
        {label}
      </span>
    </label>
  );
}
