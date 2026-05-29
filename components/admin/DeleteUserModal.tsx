"use client";

import { inputClear, labelClear } from "@/lib/form-styles";
import { useState } from "react";

interface DeleteUserModalProps {
  user: { id: string; name: string; email: string };
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteUserModal({
  user,
  onClose,
  onDeleted,
}: DeleteUserModalProps) {
  const [deleteCode, setDeleteCode] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailMatches =
    confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailMatches) {
      setError("Email does not match. Type the user's email exactly.");
      return;
    }

    if (!deleteCode.trim()) {
      setError("Enter the admin delete code.");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteCode: deleteCode.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Could not delete account");
      return;
    }

    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-2xl border-2 border-red-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="delete-user-title"
      >
        <h2 id="delete-user-title" className="text-xl font-bold text-red-800">
          Delete account permanently
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This will permanently remove{" "}
          <span className="font-bold text-slate-900">{user.name}</span> (
          {user.email}) and all their transaction history. This cannot be undone.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <form onSubmit={handleDelete} className="mt-5 space-y-4">
          <div>
            <label htmlFor="confirm-email" className={labelClear}>
              Type user email to confirm
            </label>
            <input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              required
              className={inputClear}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="delete-code" className={labelClear}>
              Admin delete code
            </label>
            <input
              id="delete-code"
              type="password"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              placeholder="Enter delete code"
              required
              className={inputClear}
              autoComplete="off"
            />
            <p className="mt-1.5 text-sm font-medium text-slate-600">
              Only Nayan R (owner) knows this code.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-slate-300 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !emailMatches}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete permanently"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
