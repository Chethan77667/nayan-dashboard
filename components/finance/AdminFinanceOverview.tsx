"use client";

import DeleteUserModal from "@/components/admin/DeleteUserModal";
import { formatINR } from "@/lib/currency";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DatePickerChip from "./DatePickerChip";

interface UserFinanceRow {
  id: string;
  name: string;
  email: string;
  date: string;
  totalIncoming: number;
  totalOutgoing: number;
  dayNet: number;
  closingBalance: number;
  totalBalance: number;
  entryCount: number;
}

export default function AdminFinanceOverview() {
  const [date, setDate] = useState("");
  const [today, setToday] = useState("");
  const [users, setUsers] = useState<UserFinanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserFinanceRow | null>(null);

  const fetchUsers = useCallback(async (selectedDate?: string) => {
    setLoading(true);
    const q = selectedDate ? `?date=${selectedDate}` : "";
    const res = await fetch(`/api/admin/finance/users${q}`);
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUsers(json.users);
      setDate(json.date);
      setToday(json.today);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const UserActions = ({ u }: { u: UserFinanceRow }) => (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/users/${u.id}?date=${date}`}
        className="text-sm font-bold text-indigo-700 hover:underline"
      >
        View history
      </Link>
      <Link
        href={`/chat?peer=${u.id}`}
        className="text-sm font-bold text-[#075e54] hover:underline"
      >
        Message
      </Link>
      <button
        type="button"
        onClick={() => setUserToDelete(u)}
        className="rounded-lg border-2 border-red-300 bg-red-50 px-3 py-1.5 text-sm font-bold text-red-800 hover:bg-red-100"
      >
        Delete account
      </button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            All users — daily accounts
          </h2>
          <p className="text-sm font-medium text-slate-600">Nayan R owner view</p>
        </div>
        {today && (
          <DatePickerChip
            selectedDate={date || today}
            today={today}
            onSelect={(d) => fetchUsers(d)}
          />
        )}
      </div>

      {loading ? (
        <p className="py-8 font-medium text-slate-600">Loading user accounts...</p>
      ) : users.length === 0 ? (
        <p className="rounded-xl border-2 border-slate-200 bg-white p-6 font-medium text-slate-600">
          No users registered yet.
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-bold text-slate-900">{u.name}</p>
                <p className="text-sm font-medium text-slate-600">{u.email}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-green-800">Incoming</p>
                    <p className="text-lg font-extrabold tabular-nums text-green-700">
                      {formatINR(u.totalIncoming)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-red-800">Outgoing</p>
                    <p className="text-lg font-extrabold tabular-nums text-red-700">
                      {formatINR(u.totalOutgoing)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xl font-extrabold tabular-nums text-slate-900">
                  Balance: {formatINR(u.totalBalance)}
                </p>
                <div className="mt-3">
                  <UserActions u={u} />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border-2 border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3 font-bold text-slate-800">User</th>
                  <th className="p-3 font-bold text-green-800">Incoming</th>
                  <th className="p-3 font-bold text-red-800">Outgoing</th>
                  <th className="p-3 font-bold text-slate-800">Day net</th>
                  <th className="p-3 font-bold text-slate-800">Total balance</th>
                  <th className="p-3 font-bold text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-sm font-medium text-slate-600">{u.email}</p>
                    </td>
                    <td className="p-3 text-lg font-bold tabular-nums text-green-700">
                      {formatINR(u.totalIncoming)}
                    </td>
                    <td className="p-3 text-lg font-bold tabular-nums text-red-700">
                      {formatINR(u.totalOutgoing)}
                    </td>
                    <td
                      className={`p-3 text-lg font-bold tabular-nums ${
                        u.dayNet >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {u.dayNet >= 0 ? "+" : ""}
                      {formatINR(u.dayNet)}
                    </td>
                    <td className="p-3 text-lg font-extrabold tabular-nums text-slate-900">
                      {formatINR(u.totalBalance)}
                    </td>
                    <td className="p-3">
                      <UserActions u={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {userToDelete && (
        <DeleteUserModal
          user={{
            id: userToDelete.id,
            name: userToDelete.name,
            email: userToDelete.email,
          }}
          onClose={() => setUserToDelete(null)}
          onDeleted={() => fetchUsers(date)}
        />
      )}
    </div>
  );
}
