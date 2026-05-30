"use client";

import { avatarColorClass, contactInitials, formatChatTime } from "./avatar";
import ChatDeleteSheet from "./ChatDeleteSheet";
import ChatImageViewer from "./ChatImageViewer";
import ChatMessageBubble from "./ChatMessageBubble";
import WhatsAppLogo from "./WhatsAppLogo";
import type { ChatContact, ChatMessage } from "./types";
import { compressImageForUpload } from "@/lib/client-image";
import { cacheChatMessages } from "@/lib/chat-image-cache";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CHAT_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const POLL_MS = 3000;

interface WhatsAppChatAppProps {
  currentUserName: string;
  backHref: string;
  backLabel?: string;
  /** Full viewport height (dedicated /chat page). */
  fullScreen?: boolean;
}

export default function WhatsAppChatApp({
  currentUserName,
  backHref,
  backLabel = "Back to dashboard",
  fullScreen = false,
}: WhatsAppChatAppProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const attachInputId = "chat-attach-image";
  const searchParams = useSearchParams();
  const initialPeerHandled = useRef(false);

  const activeContact = contacts.find((c) => c.id === activeId) ?? null;

  const loadContacts = useCallback(async () => {
    const res = await fetch("/api/chat/contacts");
    if (!res.ok) return;
    const data = await res.json();
    setContacts(data.contacts);
    setLoadingContacts(false);
  }, []);

  const loadMessages = useCallback(async (peerId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    const res = await fetch(`/api/chat/messages?peerId=${peerId}`);
    if (!silent) setLoadingMessages(false);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
    cacheChatMessages(data.messages);
    await loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    loadContacts();
    const id = setInterval(loadContacts, POLL_MS);
    return () => clearInterval(id);
  }, [loadContacts]);

  useEffect(() => {
    if (initialPeerHandled.current || loadingContacts) return;
    const peer = searchParams.get("peer");
    if (peer && contacts.some((c) => c.id === peer)) {
      initialPeerHandled.current = true;
      setActiveId(peer);
      setMobileShowThread(true);
      setMessages([]);
    }
  }, [contacts, loadingContacts, searchParams]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const id = setInterval(() => loadMessages(activeId, true), POLL_MS);
    return () => clearInterval(id);
  }, [activeId, loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeId]);

  const openChat = (id: string) => {
    setActiveId(id);
    setMobileShowThread(true);
    setMessages([]);
  };

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  });

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handlePickImage = async (file: File) => {
    try {
      const compressed = await compressImageForUpload(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      alert("Could not open that image. Try another photo from your gallery.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || sending) return;
    if (!text.trim() && !imageFile) return;

    const body = text.trim();
    const fileToSend = imageFile;
    setSending(true);

    const form = new FormData();
    form.append("recipientId", activeId);
    form.append("text", body);
    if (fileToSend) {
      form.append("image", fileToSend, fileToSend.name);
    }

    const res = await fetch("/api/chat/messages", { method: "POST", body: form });

    setSending(false);

    if (!res.ok) {
      let msg = "Could not send message";
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {
        /* ignore */
      }
      alert(msg);
      return;
    }

    setText("");
    clearImage();

    const data = await res.json();
    if (data.message) {
      cacheChatMessages([data.message]);
      setMessages((prev) => [...prev, data.message]);
    }
    loadContacts();
  };

  const handleDeleteConfirm = async (mode: "me" | "everyone") => {
    if (!deleteTarget) return;

    setDeleting(true);
    const res = await fetch(`/api/chat/messages/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    setDeleting(false);

    if (!res.ok) {
      let msg = "Could not delete message";
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {
        /* ignore */
      }
      alert(msg);
      return;
    }

    setDeleteTarget(null);
    if (activeId) loadMessages(activeId, true);
  };

  const rootClass = fullScreen
    ? "fixed inset-0 z-50 flex min-h-0 w-full overflow-hidden bg-white"
    : "flex h-[calc(100dvh-4.5rem)] min-h-[min(100dvh-4.5rem,640px)] w-full flex-1 overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm sm:rounded-xl sm:shadow-md md:h-[calc(100dvh-5rem)]";

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };

  const listHeaderClass = fullScreen
    ? "safe-top shrink-0 bg-[#075e54] px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white shadow-sm"
    : "shrink-0 bg-[#075e54] px-3 py-3 text-white shadow-sm";

  return (
    <div className={rootClass}>
      {/* Contact list */}
      <aside
        className={`flex min-h-0 w-full flex-col border-r border-slate-200 bg-white md:w-[340px] lg:w-[380px] ${
          mobileShowThread ? "hidden md:flex" : "flex"
        }`}
      >
        <header className={listHeaderClass}>
          <div className="flex items-center gap-3">
            <a
              href={backHref}
              className={`rounded-lg p-1 hover:bg-white/10 ${fullScreen ? "" : "md:hidden"}`}
              aria-label={backLabel}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <WhatsAppLogo size={36} className="shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold tracking-tight">WhatsApp</p>
              <p className="truncate text-xs text-white/75">
                {currentUserName}
              </p>
            </div>
            {fullScreen && (
              <button
                type="button"
                onClick={handleSignOut}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-white/90 hover:bg-white/10"
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        <div className="shrink-0 bg-[#f0f2f5] px-3 py-2">
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts"
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto">
          {loadingContacts && (
            <p className="p-4 text-center text-sm text-slate-500">Loading contacts...</p>
          )}
          {!loadingContacts && filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-slate-500">
              No contacts yet. When someone signs up, they appear here.
            </p>
          )}
          {filtered.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => openChat(contact.id)}
              className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-[#f5f6f6] ${
                activeId === contact.id ? "bg-[#f0f2f5]" : ""
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColorClass(contact.name)}`}
              >
                {contactInitials(contact.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-semibold text-slate-900">
                    {contact.name}
                    {contact.role === "admin" && (
                      <span className="ml-1 text-[10px] font-bold text-[#075e54]">
                        · Owner
                      </span>
                    )}
                  </p>
                  {contact.lastMessageAt && (
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {formatChatTime(contact.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-slate-500">
                    {contact.lastMessage ?? contact.email}
                  </p>
                  {contact.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#25d366] px-1.5 text-[11px] font-bold text-white">
                      {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Thread */}
      <section
        className={`flex flex-1 flex-col bg-[#e5ddd5] ${
          mobileShowThread ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeContact ? (
          <div className="hidden flex-1 flex-col items-center justify-center bg-[#f0f2f5] md:flex">
            <div className="max-w-sm text-center px-6">
              <WhatsAppLogo size={120} className="mx-auto drop-shadow-md" />
              <p className="mt-6 text-2xl font-light text-slate-600">Nayan R WhatsApp</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Send and receive messages over the internet. Accounts are verified by email sign-up.
                New team members appear in your contact list automatically.
              </p>
              <p className="mt-6 text-xs text-slate-400">
                ✓ Sent &nbsp; ✓✓ Delivered &nbsp;
                <span className="text-[#53bdeb]">✓✓ Read</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-2 py-2.5 text-white shadow-md">
              <button
                type="button"
                onClick={() => setMobileShowThread(false)}
                className="rounded-lg p-2 hover:bg-white/10 md:hidden"
                aria-label="Back to contacts"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${avatarColorClass(activeContact.name)}`}
              >
                {contactInitials(activeContact.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{activeContact.name}</p>
                <p className="truncate text-xs text-[#25d366] font-medium">online</p>
              </div>
            </header>

            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-3 py-4"
              style={{ backgroundImage: CHAT_BG }}
            >
              <p className="mx-auto mb-3 hidden max-w-md rounded-lg bg-[#fff9c4]/90 px-3 py-1.5 text-center text-[11px] font-medium text-slate-700 shadow-sm sm:block">
                Messages are stored securely on Nayan R servers.
              </p>

              {loadingMessages && messages.length === 0 && (
                <p className="text-center text-sm text-slate-600">Loading messages...</p>
              )}
              {!loadingMessages && messages.length === 0 && (
                <div className="mx-auto max-w-xs rounded-lg bg-[#fff9c4] px-3 py-2 text-center text-sm font-medium text-slate-800 shadow">
                  Messages are end-to-end in your team. Say hello to {activeContact.name}!
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  onImageClick={setViewerImage}
                  onOpenDelete={setDeleteTarget}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="safe-bottom shrink-0 border-t border-slate-200 bg-[#f0f2f5] px-2 py-2 sm:px-3"
            >
              <p className="mb-1.5 flex items-center justify-center gap-1 px-1 text-center text-[11px] leading-snug text-[#667781]">
                <svg
                  className="h-3 w-3 shrink-0 opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Your personal messages are end-to-end encrypted</span>
              </p>
              {imagePreview && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {imageFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="p-2 text-slate-500"
                    aria-label="Remove image"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm ring-1 ring-slate-200/80">
                <label
                  htmlFor={attachInputId}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#075e54] touch-manipulation active:bg-slate-100"
                  aria-label="Attach image from gallery"
                >
                  <input
                    id={attachInputId}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handlePickImage(file);
                      e.target.value = "";
                    }}
                  />
                  <svg className="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Message"
                  className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                  maxLength={4000}
                />
                <button
                  type="submit"
                  disabled={(!text.trim() && !imageFile) || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-[#25d366] disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </section>
      {viewerImage && (
        <ChatImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
      )}

      {deleteTarget && (
        <ChatDeleteSheet
          message={deleteTarget}
          open={Boolean(deleteTarget)}
          deleting={deleting}
          onClose={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
