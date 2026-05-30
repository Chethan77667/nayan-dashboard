"use client";

import { getChatImage, putChatImage } from "@/lib/chat-image-cache";
import { useEffect, useState } from "react";

type CachedChatImageProps = {
  messageId: string;
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
};

function isLegacyDiskPath(src: string) {
  return src.startsWith("/uploads/");
}

export default function CachedChatImage({
  messageId,
  src,
  alt,
  className,
  onClick,
}: CachedChatImageProps) {
  const [resolved, setResolved] = useState(() => getChatImage(messageId, src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    putChatImage(messageId, src);
    setResolved(getChatImage(messageId, src));
    setFailed(false);
  }, [messageId, src]);

  if (failed || isLegacyDiskPath(src)) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center bg-slate-100 px-4 text-center text-sm font-medium text-slate-600 ${className ?? ""}`}
      >
        {isLegacyDiskPath(src)
          ? "Photo unavailable on hosted site — send a new image"
          : "Could not load image"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className ?? "h-full w-full object-cover"}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
}
