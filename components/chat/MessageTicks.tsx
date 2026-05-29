import type { MessageStatus } from "./types";

export default function MessageTicks({ status }: { status: MessageStatus }) {
  const color =
    status === "read" ? "text-[#53bdeb]" : "text-slate-400";

  if (status === "sent") {
    return (
      <span className={`inline-flex ${color}`} aria-label="Sent">
        <CheckIcon />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex -space-x-1.5 ${color}`}
      aria-label={status === "read" ? "Read" : "Delivered"}
    >
      <CheckIcon />
      <CheckIcon />
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 15" fill="currentColor">
      <path d="M15.01 2.16l-1.28-.94-7.2 9.78-3.47-2.67-1.06 1.38 4.53 3.5 8.48-11.05z" />
    </svg>
  );
}
