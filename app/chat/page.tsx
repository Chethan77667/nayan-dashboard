import WhatsAppChatApp from "@/components/chat/WhatsAppChatApp";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  await dbConnect();
  const user = await User.findById(session.id).select("-password");
  if (!user) redirect("/signin");

  const dashboardHref =
    user.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#111b21] text-white/80">
          Loading chat...
        </div>
      }
    >
      <WhatsAppChatApp
        fullScreen
        currentUserName={user.name}
        backHref={dashboardHref}
      />
    </Suspense>
  );
}
