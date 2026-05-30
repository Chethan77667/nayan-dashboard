const MEM = new Map<string, string>();
const PREFIX = "nayan-chat-img:";
const MAX_SESSION_BYTES = 3_500_000;

function sessionKey(messageId: string) {
  return `${PREFIX}${messageId}`;
}

/** Read cached image URL (memory → sessionStorage). */
export function getChatImage(messageId: string, url: string): string {
  const mem = MEM.get(messageId);
  if (mem) return mem;

  if (typeof sessionStorage === "undefined") return url;

  try {
    const stored = sessionStorage.getItem(sessionKey(messageId));
    if (stored) {
      MEM.set(messageId, stored);
      return stored;
    }
  } catch {
    /* ignore */
  }

  return url;
}

/** Store image for faster reload when chat polls. */
export function putChatImage(messageId: string, url: string | null | undefined) {
  if (!url || !messageId) return;

  MEM.set(messageId, url);

  if (typeof sessionStorage === "undefined" || !url.startsWith("data:")) {
    return;
  }

  if (url.length > MAX_SESSION_BYTES) return;

  try {
    sessionStorage.setItem(sessionKey(messageId), url);
  } catch {
    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(PREFIX)) keys.push(k);
      }
      if (keys.length > 40) {
        keys.slice(0, keys.length - 30).forEach((k) => sessionStorage.removeItem(k));
      }
      sessionStorage.setItem(sessionKey(messageId), url);
    } catch {
      /* quota full */
    }
  }
}

export function cacheChatMessages(
  messages: { id: string; imageUrl?: string | null }[]
) {
  for (const m of messages) {
    if (m.imageUrl) putChatImage(m.id, m.imageUrl);
  }
}
