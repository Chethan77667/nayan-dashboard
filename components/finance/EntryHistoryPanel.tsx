"use client";

import { formatINR } from "@/lib/currency";
import { formatDisplayDate } from "@/lib/date";
import { inputClear, labelClear, textareaClear } from "@/lib/form-styles";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AmountInput from "./AmountInput";
import type { TransactionEntry } from "./types";

interface EntryHistoryPanelProps {
  type: "incoming" | "outgoing";
  date: string;
  entries: TransactionEntry[];
  readOnly?: boolean;
  onClose: () => void;
  onSaved: () => void;
  backLabel?: string;
}

export default function EntryHistoryPanel({
  type,
  date,
  entries: initialEntries,
  readOnly = false,
  onClose,
  onSaved,
  backLabel = "Back to dashboard",
}: EntryHistoryPanelProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries(initialEntries.filter((e) => e.type === type));
  }, [initialEntries, type]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, showComposer]);

  const title = type === "incoming" ? "Incoming" : "Outgoing";
  const isIncoming = type === "incoming";
  const headerColor = isIncoming ? "bg-[#075e54]" : "bg-[#128c7e]";
  const bubbleBg = isIncoming ? "bg-[#dcf8c6]" : "bg-white";
  const sendColor = isIncoming ? "bg-[#25d366]" : "bg-[#ea0038]";

  const total = entries.reduce((s, e) => s + e.amount, 0);

  const resetForm = () => {
    setAmount("");
    setReason("");
    setImage(null);
    setEditingId(null);
    setError("");
    setShowComposer(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("amount", amount);
    formData.append("reason", reason);
    formData.append("date", date);
    if (image) formData.append("image", image);

    const url = editingId
      ? `/api/finance/entries/${editingId}`
      : "/api/finance/entries";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Failed to save");
      return;
    }

    resetForm();
    onSaved();
  };

  const startEdit = (entry: TransactionEntry) => {
    setEditingId(entry._id);
    setAmount(String(entry.amount));
    setReason(entry.reason);
    setImage(null);
    setShowComposer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/finance/entries/${id}`, { method: "DELETE" });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#e5ddd5]">
      {/* WhatsApp-style header */}
      <header className={`flex shrink-0 items-center gap-3 px-2 py-3 text-white shadow-md ${headerColor}`}>
        <button
          type="button"
          onClick={onClose}
          className="flex min-w-0 items-center gap-1 rounded-lg px-1 py-2 hover:bg-white/10"
          aria-label={backLabel}
        >
          <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden truncate text-sm font-bold sm:inline">{backLabel}</span>
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          {isIncoming ? "+" : "−"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{title}</p>
          <p className="truncate text-xs text-white/90">
            {formatDisplayDate(date)} · Total {formatINR(total)}
          </p>
        </div>
      </header>

      {/* Chat area */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto overscroll-contain px-3 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {entries.length === 0 && (
          <div className="mx-auto max-w-xs rounded-lg bg-[#fff9c4] px-3 py-2 text-center text-sm font-medium text-slate-800 shadow">
            No {type} entries for this day. Tap + below to add one.
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry._id}
            className={`mb-2 flex ${isIncoming ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[88%] rounded-lg px-3 py-2 shadow-sm ${bubbleBg} ${
                isIncoming ? "rounded-tr-none" : "rounded-tl-none"
              }`}
            >
              <p className="text-xl font-extrabold tabular-nums text-slate-900">
                {formatINR(entry.amount)}
              </p>
              {entry.reason && (
                <p className="mt-1 text-sm font-medium leading-snug text-slate-800">
                  {entry.reason}
                </p>
              )}
              {entry.imageUrl && (
                <a
                  href={entry.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-2 block h-40 w-full min-w-[200px] overflow-hidden rounded-md"
                >
                  <Image
                    src={entry.imageUrl}
                    alt="Attachment"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </a>
              )}
              <div className="mt-1 flex items-center justify-end gap-2">
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="text-xs font-bold text-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      className="text-xs font-bold text-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
                <span className="text-[11px] font-medium text-slate-600">
                  {new Date(entry.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Composer */}
      {!readOnly && (
        <div data-lenis-prevent className="safe-bottom shrink-0 border-t border-slate-300/50 bg-[#f0f0f0] p-2">
          {showComposer ? (
            <form onSubmit={handleSubmit} className="space-y-2 rounded-xl bg-white p-3 shadow-lg">
              <p className="text-sm font-bold text-slate-900">
                {editingId ? "Edit message" : `New ${title.toLowerCase()} entry`}
              </p>
              {error && (
                <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-800">
                  {error}
                </p>
              )}

              <AmountInput
                value={amount}
                onChange={setAmount}
                accent={isIncoming ? "green" : "red"}
              />

              <div>
                <label className={labelClear}>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className={textareaClear}
                  placeholder="Write reason here..."
                />
              </div>

              <div>
                <label className={labelClear}>Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className={`${inputClear} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-indigo-800`}
                />
                {image && (
                  <p className="mt-1 text-sm font-semibold text-green-800">
                    Selected: {image.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-full border-2 border-slate-300 py-3 text-sm font-bold text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-full py-3 text-sm font-bold text-white disabled:opacity-60 ${sendColor}`}
                >
                  {loading ? "Sending..." : editingId ? "Update" : "Send"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowComposer(true)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow ${sendColor}`}
                aria-label="Add entry"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowComposer(true)}
                className={`flex-1 rounded-full border-2 border-slate-300 bg-white px-4 py-3 text-left text-base font-medium text-slate-600`}
              >
                Type amount & reason...
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
