"use client";

import Link from "next/link";
import { useActionState } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import { inputClear, labelClear } from "@/lib/form-styles";
import { signinAction, type SigninState } from "./actions";

const initialState: SigninState = {};

export default function SigninPage() {
  const [state, formAction, pending] = useActionState(signinAction, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8">
      <div className="mb-4 w-full max-w-md">
        <BackToDashboard href="/" label="Back to home" />
      </div>
      <form
        action={formAction}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>

        {state.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className={labelClear}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={inputClear}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClear}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className={inputClear}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
