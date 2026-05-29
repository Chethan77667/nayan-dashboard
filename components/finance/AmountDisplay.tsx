import { formatINR } from "@/lib/currency";

interface AmountDisplayProps {
  amount: number;
  size?: "md" | "lg" | "xl";
  variant?: "default" | "incoming" | "outgoing";
  label?: string;
}

export default function AmountDisplay({
  amount,
  size = "lg",
  variant = "default",
  label,
}: AmountDisplayProps) {
  const sizeClass = {
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  }[size];

  const colorClass = {
    default: "text-slate-900",
    incoming: "text-green-700",
    outgoing: "text-red-700",
  }[variant];

  return (
    <div>
      {label && (
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      )}
      <p className={`font-extrabold tracking-tight tabular-nums ${sizeClass} ${colorClass}`}>
        {formatINR(amount)}
      </p>
    </div>
  );
}
