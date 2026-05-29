"use client";

import type { ChatMessage } from "./types";

interface ChatDeleteSheetProps {
  message: ChatMessage;
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: "me" | "everyone") => void;
  deleting?: boolean;
}

/** WhatsApp-style delete sheet — bottom on mobile, centered on desktop */
export default function ChatDeleteSheet({
  message,
  open,
  onClose,
  onConfirm,
  deleting = false,
}: ChatDeleteSheetProps) {
  if (!open) return null;

  const preview =
    message.deleted
      ? "This message was deleted"
      : message.imageUrl && !message.text
        ? "📷 Photo"
        : message.text.length > 80
          ? `${message.text.slice(0, 80)}…`
          : message.text;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal
        aria-labelledby="delete-dialog-title"
        className="safe-bottom relative z-10 w-full max-w-md pb-2 sm:pb-0"
      >
        <div className="rounded-t-2xl bg-[#1f2c34] text-white shadow-2xl sm:rounded-2xl">
          <div className="border-b border-white/10 px-5 py-4 text-center">
            <p id="delete-dialog-title" className="text-base font-semibold">
              Delete message?
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-white/70">{preview}</p>
          </div>

          <div className="flex flex-col py-1">
            <button
              type="button"
              disabled={deleting}
              onClick={() => onConfirm("me")}
              className="w-full border-b border-white/10 px-5 py-4 text-center text-[17px] font-medium text-white active:bg-white/10 disabled:opacity-50"
            >
              Delete for me
            </button>

            {message.isMine && message.canDeleteForEveryone && (
              <button
                type="button"
                disabled={deleting}
                onClick={() => onConfirm("everyone")}
                className="w-full border-b border-white/10 px-5 py-4 text-center text-[17px] font-semibold text-[#f15c6d] active:bg-white/10 disabled:opacity-50"
              >
                Delete for everyone
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={deleting}
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-[#1f2c34] px-5 py-4 text-center text-[17px] font-semibold text-[#25d366] shadow-lg active:bg-[#2a3942] disabled:opacity-50 sm:mt-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
