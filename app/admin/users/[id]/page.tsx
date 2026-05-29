import AdminUserActions from "@/components/admin/AdminUserActions";
import { ADMIN_DISPLAY_NAME } from "@/lib/branding";
import DashboardLayout from "@/components/DashboardLayout";
import DailyFinanceTracker from "@/components/finance/DailyFinanceTracker";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserFinancePage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "admin") redirect("/dashboard");

  const { id } = await params;

  await dbConnect();
  const admin = await User.findById(session.id).select("-password");
  const targetUser = await User.findById(id).select("-password");

  if (!targetUser) redirect("/admin/dashboard");

  return (
    <DashboardLayout
      userName={ADMIN_DISPLAY_NAME}
      role="admin"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
      links={[
        { href: "/admin/dashboard", label: "Owner dashboard" },
        { href: `/admin/users/${id}`, label: targetUser.name },
      ]}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{targetUser.email}</p>
        <AdminUserActions
          user={{
            id: targetUser._id.toString(),
            name: targetUser.name,
            email: targetUser.email,
          }}
        />
      </div>
      <DailyFinanceTracker
        userName={targetUser.name}
        readOnly
        adminUserId={id}
        backHref="/admin/dashboard"
        backLabel="Back to dashboard"
      />
    </DashboardLayout>
  );
}
