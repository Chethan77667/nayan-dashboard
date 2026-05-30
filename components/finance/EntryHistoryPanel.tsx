"use client";

import { formatINR } from "@/lib/currency";
import { formatDisplayDate } from "@/lib/date";
import { labelClear, textareaClear } from "@/lib/form-styles";
import MobileFileInput from "@/components/MobileFileInput";
import ChatImageViewer from "@/components/chat/ChatImageViewer";
import { useMobileBackStack } from "@/components/useMobileBackStack";
import { compressImageForUpload } from "@/lib/client-image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setAmount("");
    setReason("");
    setImage(null);
    setEditingId(null);
    setError("");
    setShowComposer(false);
  }, []);

  const dismissPanel = useMobileBackStack(true, onClose);
  const dismissComposer = useMobileBackStack(showComposer && !viewerImage, resetForm);
  const dismissViewer = useMobileBackStack(!!viewerImage, () => setViewerImage(null));

  const handleHeaderBack = () => {
    if (viewerImage) dismissViewer();
    else if (showComposer) dismissComposer();
    else dismissPanel();
  };

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

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

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

    onSaved();
    dismissComposer();
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
    <div className="fixed inset-0 z-50 flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#e5ddd5]">
      {/* WhatsApp-style header */}
      <header className={`flex shrink-0 items-center gap-3 px-2 py-3 text-white shadow-md ${headerColor}`}>
        <button
          type="button"
          onClick={handleHeaderBack}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-lg px-1 py-2 touch-manipulation hover:bg-white/10 active:bg-white/20"
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
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 ${
          showComposer ? "max-h-[32dvh] sm:max-h-none" : ""
        }`}
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
                <button
                  type="button"
                  onClick={() => setViewerImage(entry.imageUrl)}
                  className="relative mt-2 block w-full min-w-[200px] touch-manipulation overflow-hidden rounded-md"
                  aria-label="View image and download"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt="Attachment"
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover"
                  />
                </button>
              )}
              <div className="mt-1 flex items-center justify-end gap-2">
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="min-h-[36px] rounded-lg px-2 py-1 text-xs font-bold text-indigo-700 touch-manipulation active:bg-indigo-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      className="min-h-[36px] rounded-lg px-2 py-1 text-xs font-bold text-red-700 touch-manipulation active:bg-red-50"
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
        <div
          className={`safe-bottom relative z-30 shrink-0 border-t border-slate-300/50 bg-[#f0f0f0] p-2 ${
            showComposer ? "flex min-h-0 max-h-[68dvh] flex-col" : ""
          }`}
        >
          {showComposer ? (
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-lg"
            >
              <div
                data-lenis-prevent
                className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3"
              >
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

                <div className="relative z-20">
                  <p className={labelClear}>Photo (optional)</p>
                  <MobileFileInput
                    label={image ? "Change photo" : "Choose photo from gallery"}
                    onFile={(file) => {
                      void (async () => {
                        try {
                          setImage(await compressImageForUpload(file));
                          setError("");
                        } catch {
                          setError("Could not open that photo. Try another from gallery.");
                        }
                      })();
                    }}
                  />
                  {imagePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => setViewerImage(imagePreviewUrl)}
                      className="relative mt-2 block w-full touch-manipulation"
                      aria-label="View full image"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="max-h-36 w-full rounded-lg object-cover"
                      />
                      <span className="mt-1 block text-center text-xs font-semibold text-indigo-700">
                        Tap to view · download
                      </span>
                    </button>
                  )}
                  {image && (
                    <p className="mt-1 truncate text-sm font-semibold text-green-800">
                      Selected: {image.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3">
                <button
                  type="button"
                  onClick={dismissComposer}
                  className="flex-1 rounded-full border-2 border-slate-300 py-3 text-sm font-bold text-slate-800 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount.trim()}
                  className={`flex-1 rounded-full py-3 text-sm font-bold text-white touch-manipulation disabled:opacity-60 ${sendColor}`}
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
      {viewerImage && (
        <ChatImageViewer src={viewerImage} onClose={dismissViewer} />
      )}
    </div>
  );
}
