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
    return <Loading fullScreen text="Loading student dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-emerald-600">Student Portal</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Student Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Stay on top of your coursework, submit assignments, and track your
          academic progress from one place.
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-50 blur-2xl" />

          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-sm">
              S
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Welcome to your Student Dashboard
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View your assignments, submit your answers before deadlines, and
              keep track of your grades and teacher feedback.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              📚
            </div>

            <h3 className="font-semibold text-slate-900">View Assignments</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              View available assignments, descriptions, deadlines, and marks.
            </p>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              📝
            </div>

            <h3 className="font-semibold text-slate-900">Submit Answers</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Submit your assignment answers before the deadline.
            </p>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              🎓
            </div>

            <h3 className="font-semibold text-slate-900">Track Your Grades</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Check your marks, submission status, and teacher feedback.
            </p>
          </div>
        </Card>
      </div>

      {/* Academic Activity */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Academic Activities
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Complete Assignments
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Check your assignments regularly and submit them before their
                deadlines.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Monitor Deadlines
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of upcoming deadlines to avoid late submissions.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Review Feedback
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Read teacher feedback to understand your performance and
                improve.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Track Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Monitor your grades and submission status throughout the
                semester.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
