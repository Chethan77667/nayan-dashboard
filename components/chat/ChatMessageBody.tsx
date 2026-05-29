import { splitTextWithLinks } from "@/lib/chat-text";

export default function ChatMessageBody({
  text,
  deleted,
}: {
  text: string;
  deleted?: boolean;
}) {
  if (deleted) {
    return (
      <p className="text-[14px] italic text-slate-500">This message was deleted</p>
    );
  }

  const parts = splitTextWithLinks(text);

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-snug text-slate-900">
      {parts.map((part, i) =>
        part.type === "link" ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#027eb5] underline"
          >
            {part.value}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </p>
  );
}
