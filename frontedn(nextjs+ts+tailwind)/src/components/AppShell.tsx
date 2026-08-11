"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { Role } from "@/types";
import Loading from "@/components/Loading";

const nav: Record<Role, [string, string][]> = {
  Admin: [
    ["/admin", "Dashboard"],
    ["/admin/users", "Users"],
    ["/admin/courses", "Courses"],
    ["/admin/subjects", "Subjects"],
    ["/admin/assignments", "Assignments"],
    ["/admin/submissions", "Submissions"],
  ],

  Teacher: [
    ["/teacher", "Dashboard"],
    ["/teacher/assignments", "Assignments"],
    ["/teacher/submissions", "Submissions"],
  ],

  Student: [
    ["/student", "Dashboard"],
    ["/student/assignments", "Assignments"],
    ["/student/submissions", "My Submissions"],
  ],
};

export default function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    try {
      setUser(getUser());
    } catch (error) {
      console.error("Failed to load user session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsNavigating(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleNavigation = () => {
    setIsNavigating(true);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);

      clearSession();

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isNavigating && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading page..." />
        </div>
      )}

      <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
            A
          </div>

          <p className="text-base font-bold tracking-tight text-slate-900">
            ASMS
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-[90] border-b border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden">
          {/* User Info */}

          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {user?.email || "User"}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
              {role}
            </span>
          </div>

          <nav className="space-y-1">
            {nav[role].map(([href, label]) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleNavigation}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                Logging out...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      )}

      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          hidden
          h-screen
          w-72
          shrink-0
          flex-col
          border-r
          border-slate-200
          bg-white
          md:flex
        "
      >
        <div className="shrink-0 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-md shadow-indigo-600/20">
              A
            </div>

            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              ASMS
            </h1>
          </div>
        </div>

        <div className="shrink-0 px-4 pt-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.email || "User"}
                </p>

                <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Navigation
          </p>

          <div className="space-y-1">
            {nav[role].map(([href, label]) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleNavigation}
                  className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition ${
                        isActive
                          ? "bg-white"
                          : "bg-slate-300 group-hover:bg-indigo-500"
                      }`}
                    />

                    <span>{label}</span>
                  </div>

                  {isActive && (
                    <svg
                      className="h-4 w-4 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                Logging out...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
            Assignment and Submission Management System
          </p>
        </div>
      </aside>

      <main className="min-w-0 md:ml-72 md:h-screen md:overflow-y-auto">
        <div className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur-md md:flex">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Assignment and Submission Management System
            </p>

            <p className="text-sm font-semibold text-slate-800">
              {role} Workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="max-w-[220px] truncate text-xs font-medium text-slate-700">
                {user?.email || "User"}
              </p>

              <p className="text-[10px] text-slate-400">{role}</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {role} Panel
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Welcome back
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your assignments and submissions from your workspace.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
