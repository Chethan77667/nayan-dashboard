"use client";

export default function ChatImageViewer({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = src.startsWith("data:")
      ? "nayan-chat-photo.jpg"
      : (src.split("/").pop() ?? "image.jpg");
    if (src.startsWith("data:")) {
      a.click();
      return;
    }
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal
    >
      <header className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={download}
          className="flex items-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 text-sm font-bold"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </header>
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Chat image"
          className="max-h-[85dvh] max-w-full object-contain"
          decoding="async"
        />
      </div>
    </div>
  );
}
