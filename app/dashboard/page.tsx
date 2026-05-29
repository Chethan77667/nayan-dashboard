import DashboardLayout from "@/components/DashboardLayout";
import DailyFinanceTracker from "@/components/finance/DailyFinanceTracker";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function UserDashboard() {
  const session = await getSession();
  if (!session) redirect("/signin");

  await dbConnect();
  const user = await User.findById(session.id).select("-password");
  if (!user) redirect("/signin");

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <DashboardLayout
      userName={user.name}
      role={user.role}
      links={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/chat", label: "WhatsApp" },
      ]}
    >
      <DailyFinanceTracker userName={user.name} />
    </DashboardLayout>
  );
}
