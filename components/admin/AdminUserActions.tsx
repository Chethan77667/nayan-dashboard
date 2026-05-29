"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteUserModal from "./DeleteUserModal";

interface AdminUserActionsProps {
  user: { id: string; name: string; email: string };
}

export default function AdminUserActions({ user }: AdminUserActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100"
      >
        Delete account
      </button>
      {open && (
        <DeleteUserModal
          user={user}
          onClose={() => setOpen(false)}
          onDeleted={() => router.push("/admin/dashboard")}
        />
      )}
    </>
  );
}
