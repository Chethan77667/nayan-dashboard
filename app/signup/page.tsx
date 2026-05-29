"use client";

import Link from "next/link";
import { useActionState } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import { inputClear, labelClear } from "@/lib/form-styles";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8">
      <div className="mb-4 w-full max-w-md">
        <BackToDashboard href="/" label="Back to home" />
      </div>
      <form
        action={formAction}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-900">Sign Up</h1>

        {state.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClear}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              required
              autoComplete="name"
              className={inputClear}
            />
          </div>

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
              placeholder="Create a password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClear}
            />
            <p className="mt-1 text-sm font-medium text-slate-600">At least 6 characters</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
