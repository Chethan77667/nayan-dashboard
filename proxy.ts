import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/chat");
  const isAuthPage =
    pathname.startsWith("/signin") || pathname.startsWith("/signup");

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const session = verifyToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }

    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isAuthPage && token) {
    const session = verifyToken(token);
    if (session) {
      const dest =
        session.role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/chat",
    "/chat/:path*",
    "/signin",
    "/signup",
  ],
};
