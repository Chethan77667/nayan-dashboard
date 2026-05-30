"use client";

import ImagePickerTrigger from "@/components/ImagePickerTrigger";

type MobileFileInputProps = {
  id?: string;
  onFile: (file: File) => void;
  label?: string;
  className?: string;
};

/** Large tap target that opens the gallery on Android/iOS. */
export default function MobileFileInput({
  onFile,
  label = "Choose photo from gallery",
  className,
}: MobileFileInputProps) {
  return (
    <ImagePickerTrigger
      onFile={onFile}
      aria-label={label}
      className={
        className ??
        "mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-900 touch-manipulation active:bg-indigo-100"
      }
    >
      {label}
    </ImagePickerTrigger>
  );
}
