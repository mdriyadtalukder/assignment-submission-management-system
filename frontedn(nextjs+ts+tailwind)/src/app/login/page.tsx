"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { saveSession, dashboardPath } from "@/lib/auth";
import type { LoginResponse } from "@/types";
import { Button, Card, Input } from "@/components/ui";

export default function Login() {
  const r = useRouter();

  const [e, setE] = useState("admin@asms.com");
  const [p, setP] = useState("Admin@123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function s(x: FormEvent) {
    x.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const d = await post<LoginResponse>("/auth/login", {
        email: e,
        password: p,
      });

      saveSession(d);
      r.replace(dashboardPath(d.user.role));
    } catch (z) {
      setErr(z instanceof Error ? z.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/25">
            A
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Assignment and Submission Management System
          </h1>
        </div>

        {/* Login Card */}
        <Card className="w-full border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to access your workspace.
            </p>
          </div>

          <form onSubmit={s} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={e}
                onChange={(x) => {
                  setE(x.target.value);
                  if (err) setErr("");
                }}
                required
                disabled={loading}
                className="h-11 w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={p}
                onChange={(x) => {
                  setP(x.target.value);
                  if (err) setErr("");
                }}
                required
                disabled={loading}
                className="h-11 w-full"
              />
            </div>

            {/* Error */}
            {err && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Login failed
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-600">{err}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Demo accounts
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-700">Admin</p>

                <p className="mt-0.5 text-xs text-slate-500">
                  admin@asms.com
                  <span className="mx-1.5 text-slate-300">•</span>
                  Admin@123
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-700">Teacher</p>

                <p className="mt-0.5 text-xs text-slate-500">
                  teacher@asms.com
                  <span className="mx-1.5 text-slate-300">•</span>
                  Teacher@123
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-700">Student</p>

                <p className="mt-0.5 text-xs text-slate-500">
                  student@asms.com
                  <span className="mx-1.5 text-slate-300">•</span>
                  Student@123
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ASMS. All rights reserved.
        </p>
      </div>
    </main>
  );
}
