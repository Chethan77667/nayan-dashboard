"use client";

import { formatINR } from "@/lib/currency";
import { inputClear, labelClear } from "@/lib/form-styles";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  accent: "green" | "red";
  id?: string;
  compact?: boolean;
}

export default function AmountInput({
  value,
  onChange,
  accent,
  id = "amount",
  compact = false,
}: AmountInputProps) {
  const parsed = parseFloat(value.replace(/,/g, ""));
  const showPreview = value.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

  const ring =
    accent === "green"
      ? "focus:border-green-600 focus:ring-green-100"
      : "focus:border-red-600 focus:ring-red-100";

  const previewColor = accent === "green" ? "text-green-800" : "text-red-800";

  if (compact) {
    return (
      <div className="flex-1">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          required
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="Amount ₹"
          className={`${inputClear} ${ring} py-2.5 text-lg font-bold`}
        />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={labelClear}>
        Amount (₹)
      </label>

      {showPreview && (
        <div
          className={`mb-3 rounded-xl border-2 border-dashed px-4 py-3 text-center ${
            accent === "green"
              ? "border-green-300 bg-green-50"
              : "border-red-300 bg-red-50"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
            You are entering
          </p>
          <p className={`mt-1 text-3xl font-extrabold tabular-nums ${previewColor}`}>
            {formatINR(parsed)}
          </p>
        </div>
      )}

      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500"
          aria-hidden
        >
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          required
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="Enter amount"
          className={`${inputClear} py-4 pl-12 text-2xl font-bold ${ring}`}
        />
      </div>
      <p className="mt-1.5 text-sm font-medium text-slate-600">
        Enter amount in Indian Rupees
      </p>
    </div>
  );
}
