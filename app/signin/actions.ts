"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export type SigninState = {
  error?: string;
};

export async function signinAction(
  _prev: SigninState,
  formData: FormData
): Promise<SigninState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let destination = "/dashboard";

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: "User not found. Please sign up first." };
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return { error: "Invalid password" };
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    destination =
      user.role === "admin" ? "/admin/dashboard" : "/dashboard";
  } catch (error) {
    console.error("Signin action error:", error);
    const msg =
      error instanceof Error && error.message.includes("ECONNREFUSED")
        ? "Cannot connect to MongoDB. Please start MongoDB and try again."
        : "Sign in failed. Please try again.";
    return { error: msg };
  }

  redirect(destination);
}
