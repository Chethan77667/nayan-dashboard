import ChatFullScreenShell from "@/components/chat/ChatFullScreenShell";
import WhatsAppChatApp from "@/components/chat/WhatsAppChatApp";
import { displayUserName } from "@/lib/branding";
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
    <ChatFullScreenShell
      userName={displayUserName(user.name, user.role)}
      role={user.role}
      dashboardHref={dashboardHref}
    >
      <Suspense
        fallback={
          <p className="flex flex-1 items-center justify-center text-white/80">
            Loading chat...
          </p>
        }
      >
        <WhatsAppChatApp
          fullScreen
          currentUserName={user.name}
          backHref={dashboardHref}
        />
      </Suspense>
    </ChatFullScreenShell>
  );
}
