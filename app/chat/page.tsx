import DashboardLayout from "@/components/DashboardLayout";
import WhatsAppChatApp from "@/components/chat/WhatsAppChatApp";
import { Suspense } from "react";
import { displayUserName } from "@/lib/branding";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  await dbConnect();
  const user = await User.findById(session.id).select("-password");
  if (!user) redirect("/signin");

  const isAdmin = user.role === "admin";
  const dashboardHref = isAdmin ? "/admin/dashboard" : "/dashboard";
  const chatHref = isAdmin ? "/admin/chat" : "/chat";

  const links = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Owner dashboard" },
        { href: chatHref, label: "WhatsApp" },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: chatHref, label: "WhatsApp" },
      ];

  return (
    <DashboardLayout
      userName={displayUserName(user.name, user.role)}
      role={user.role}
      links={links}
    >
      <div className="-mx-4 -mt-2 flex min-h-0 flex-1 flex-col sm:-mx-6 md:-mx-8 lg:-mt-4">
        <Suspense fallback={<p className="text-slate-600">Loading chat...</p>}>
          <WhatsAppChatApp
            currentUserName={user.name}
            backHref={dashboardHref}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
