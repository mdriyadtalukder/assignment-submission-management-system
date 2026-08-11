"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { Card, Button } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Dashboard currently has no API request.
    // This gives the page a consistent loading experience.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  function navigateTo(url: string) {
    setIsNavigating(true);

    try {
      router.push(url);
    } catch (err) {
      console.error("Navigation failed:", err);
      setIsNavigating(false);
    }
  }

  const stats = [
    {
      title: "Users",
      value: "Manage",
      description: "Students, teachers & admins",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Courses",
      value: "Manage",
      description: "Create and organize courses",
      icon: BookOpen,
      href: "/admin/courses",
    },
    {
      title: "Subjects",
      value: "Manage",
      description: "Subjects and teacher assignments",
      icon: GraduationCap,
      href: "/admin/subjects",
    },
    {
      title: "Assignments",
      value: "View",
      description: "Monitor academic assignments",
      icon: ClipboardList,
      href: "/admin/assignments",
    },
    {
      title: "Submissions",
      value: "Review",
      description: "Track student submissions",
      icon: FileCheck2,
      href: "/admin/submissions",
    },
  ];

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <>
      {/* ======================================
          NAVIGATION LOADING
      ====================================== */}

      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading page..." />
        </div>
      )}

      <div className="space-y-8">
        {/* ======================================
            HERO
        ====================================== */}

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-sm md:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />

          <div className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Administrator Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Manage your academic platform from one centralized workspace.
              Oversee users, courses, subjects, assignments, and student
              submissions efficiently.
            </p>
          </div>
        </div>

        {/* ======================================
            PLATFORM MANAGEMENT
        ====================================== */}

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Platform Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access and manage important areas of the platform.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigateTo(item.href)}
                  disabled={isNavigating}
                  className="group text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Card className="h-full border-slate-200 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                    </div>

                    <div className="mt-5">
                      <p className="text-sm font-medium text-slate-500">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {item.value}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <Card className="border-slate-200 shadow-sm">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start managing your platform with the most common actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => navigateTo("/admin/users/create")}
                disabled={isNavigating}
              >
                Create User
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateTo("/admin/courses/create")}
                disabled={isNavigating}
              >
                Create Course
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateTo("/admin/subjects/create")}
                disabled={isNavigating}
              >
                Create Subject
              </Button>
            </div>
          </div>
        </Card>

        {/* ======================================
            OVERVIEW
        ====================================== */}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Users className="h-5 w-5 text-slate-700" />
              </div>

              <h3 className="font-semibold text-slate-900">User Management</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage students, teachers, and administrators. Update user
                information, assign courses, and control platform access.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigateTo("/admin/users")}
                disabled={isNavigating}
              >
                Manage Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <ClipboardList className="h-5 w-5 text-slate-700" />
              </div>

              <h3 className="font-semibold text-slate-900">
                Academic Management
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Monitor courses, subjects, assignments, and student submissions
                to keep academic activities organized.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigateTo("/admin/assignments")}
                disabled={isNavigating}
              >
                View Assignments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
