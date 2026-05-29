const URL_REGEX =
  /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;

export function messagePreview(text: string | null, imageUrl: string | null): string {
  if (text?.trim()) {
    const t = text.trim();
    return t.length > 60 ? `${t.slice(0, 60)}…` : t;
  }
  if (imageUrl) return "📷 Photo";
  return "";
}

export function splitTextWithLinks(text: string): Array<{ type: "text" | "link"; value: string }> {
  const parts: Array<{ type: "text" | "link"; value: string }> = [];
  let last = 0;
  const re = new RegExp(URL_REGEX.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "link", value: match[0] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return parts.length ? parts : [{ type: "text", value: text }];
}
