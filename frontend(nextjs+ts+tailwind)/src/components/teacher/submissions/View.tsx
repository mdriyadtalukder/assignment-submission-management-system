"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import type { Submission } from "@/types";
import { Button, Card } from "@/components/ui";
import Loading from "@/components/Loading";

export default function View() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");

  function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    if (typeof err === "string" && err.trim()) {
      return err;
    }

    return fallback;
  }

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await get<Submission[]>("/teacher/submissions");

      if (!Array.isArray(data)) {
        setSubmissions([]);
        setError("Invalid submission data received from the server.");
        return;
      }

      setSubmissions(data);
    } catch (err) {
      setSubmissions([]);
      setError(
        getErrorMessage(err, "Failed to load submissions. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function isGraded(status?: string) {
    return (
      status === "Graded" ||
      status === "Rejected" ||
      status === "Late"
    );
  }

  async function navigateTo(url: string) {
    try {
      setNavigating(true);
      setError("");

      router.push(url);
    } catch (err) {
      setNavigating(false);
      setError(
        getErrorMessage(err, "Failed to open the requested page."),
      );
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading submissions..." />;
  }

  return (
    <>
      {navigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading page..." />
        </div>
      )}

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Student Submissions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Review, grade, and modify student submissions.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{error}</p>

              <Button
                type="button"
                variant="outline"
                onClick={load}
                disabled={loading}
              >
                {loading ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">
              No student submissions found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const processed = isGraded(submission?.status);

              return (
                <div
                  key={submission.id}
                  className="rounded-lg border p-5"
                >
                  <div className="mb-4 grid gap-2 text-sm md:grid-cols-3">
                    <div>
                      <span className="font-medium">Assignment</span>

                      <p className="break-all text-slate-500">
                        {submission.assignmentId || "-"}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium">Student</span>

                      <p className="break-all text-slate-500">
                        {submission.studentId || "-"}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium">Status</span>

                      <p
                        className={
                          processed
                            ? "font-medium text-green-600"
                            : "font-medium text-yellow-600"
                        }
                      >
                        {submission.status || "Submitted"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="mb-2 text-sm font-medium">
                      Student Answer
                    </p>

                    <div className="rounded-md bg-slate-50 p-4">
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                        {submission.content || "-"}
                      </p>
                    </div>
                  </div>

                  {submission.marks !== null &&
                    submission.marks !== undefined && (
                      <div className="mb-4">
                        <p className="text-sm">
                          <span className="font-medium">Marks:</span>{" "}
                          {submission.marks}
                        </p>

                        {submission.feedback && (
                          <p className="mt-1 whitespace-pre-wrap text-sm">
                            <span className="font-medium">
                              Feedback:
                            </span>{" "}
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={processed || navigating}
                      onClick={() =>
                        navigateTo(
                          `/teacher/submissions/${submission.id}/grading`,
                        )
                      }
                    >
                      {navigating ? "Loading..." : "Grading"}
                    </Button>

                    <Button
                      disabled={!processed || navigating}
                      variant="outline"
                      onClick={() =>
                        navigateTo(
                          `/teacher/submissions/${submission.id}/modify`,
                        )
                      }
                    >
                      {navigating ? "Loading..." : "Modify"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}