"use client";

import CachedChatImage from "./CachedChatImage";
import MessageTicks from "./MessageTicks";
import ChatMessageBody from "./ChatMessageBody";
import { useLongPress } from "./useLongPress";
import type { ChatMessage } from "./types";

export default function ChatMessageBubble({
  msg,
  onImageClick,
  onOpenDelete,
}: {
  msg: ChatMessage;
  onImageClick: (url: string) => void;
  onOpenDelete: (msg: ChatMessage) => void;
}) {
  const openMenu = () => {
    if (!msg.deleted) onOpenDelete(msg);
  };

  const { handlers: longPressHandlers, firedRef } = useLongPress(openMenu);

  const bubbleClass = msg.isMine
    ? "rounded-tr-none bg-[#dcf8c6]"
    : "rounded-tl-none bg-white";

  return (
    <div className={`mb-1 flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[85%] select-none rounded-lg shadow-sm ${bubbleClass} ${
          !msg.deleted ? "cursor-pointer active:opacity-90" : ""
        }`}
        {...(!msg.deleted ? longPressHandlers : {})}
        onClick={(e) => {
          if (msg.deleted) return;
          if (firedRef.current) {
            e.preventDefault();
            firedRef.current = false;
          }
        }}
      >
        {!msg.deleted && msg.imageUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(msg.imageUrl!);
            }}
            className="block w-full overflow-hidden rounded-t-lg"
          >
            <div className="relative h-48 w-full min-w-[200px] sm:h-56">
              <CachedChatImage
                messageId={msg.id}
                src={msg.imageUrl}
                alt="Shared image"
                className="h-48 w-full min-w-[200px] object-cover sm:h-56"
              />
            </div>
          </button>
        )}

        {(msg.text || msg.deleted) && (
          <div className={`px-3 py-2 ${msg.imageUrl && !msg.deleted ? "pt-1" : ""}`}>
            <ChatMessageBody text={msg.text} deleted={msg.deleted} />
          </div>
        )}

        <div
          className={`flex items-center justify-end gap-1 px-2 pb-1.5 ${
            !msg.text && msg.imageUrl && !msg.deleted ? "pt-0" : ""
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500">
            {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {msg.isMine && !msg.deleted && <MessageTicks status={msg.status} />}
        </div>

        {!msg.deleted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMenu();
            }}
            className={`absolute top-0.5 rounded-full bg-white/95 p-1.5 shadow-sm ${
              msg.isMine ? "-left-9" : "-right-9"
            } opacity-80 sm:opacity-0 sm:group-hover:opacity-100`}
            aria-label="Message options"
          >
            <svg className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
