import WhatsAppFab from "@/components/chat/WhatsAppFab";
import { ADMIN_DISPLAY_NAME } from "@/lib/branding";
import DashboardCard from "@/components/DashboardCard";
import DashboardLayout from "@/components/DashboardLayout";
import AdminFinanceOverview from "@/components/finance/AdminFinanceOverview";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "admin") redirect("/dashboard");

  await dbConnect();
  const admin = await User.findById(session.id).select("-password");
  const users = await User.find({ role: "user" }).select("-password");

  return (
    <DashboardLayout
      userName={ADMIN_DISPLAY_NAME}
      role="admin"
      links={[
        { href: "/admin/dashboard", label: "Owner dashboard" },
        { href: "/chat", label: "WhatsApp" },
      ]}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <DashboardCard title="Total users" value={users.length} />
        <DashboardCard
          title="Owner"
          value={ADMIN_DISPLAY_NAME}
          description="Owner view — read only for user entries"
        />
      </div>

      <div className="relative pb-24">
        <AdminFinanceOverview />
        <WhatsAppFab />
      </div>
    </DashboardLayout>
  );
}
