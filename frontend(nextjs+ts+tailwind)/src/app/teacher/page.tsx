"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading fullScreen text="Loading teacher dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">Teacher Portal</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Teacher Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your assignments, publish coursework, and review student
          submissions from one place.
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-50 blur-2xl" />

          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
              T
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Welcome to your Teacher Dashboard
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create and manage assignments, publish coursework, and evaluate
              student submissions efficiently.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              📝
            </div>

            <h3 className="font-semibold text-slate-900">Manage Assignments</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Create, update, publish, and manage your assignments.
            </p>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              📚
            </div>

            <h3 className="font-semibold text-slate-900">Manage Coursework</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              View your assigned courses and subjects.
            </p>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              ✓
            </div>

            <h3 className="font-semibold text-slate-900">Review Submissions</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Review student answers, assign marks, and provide feedback.
            </p>
          </div>
        </Card>
      </div>

      {/* Responsibilities */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Teacher Responsibilities
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Create Assignments
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Prepare assignments with deadlines and maximum marks.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Publish Assignments
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Publish assignments when they are ready for students.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Grade Students
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Review submissions and assign marks with useful feedback.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Track Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Monitor assignment and submission activity.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
