"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Submission } from "@/types";
import { Button, Card } from "@/components/ui";
import Loading from "@/components/Loading";

export default function View() {
  const [a, setA] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await get<Submission[]>("/student/submissions");

      setA(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load submissions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <Loading fullScreen text="Loading submissions..." />;
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">My Submissions</h2>

        <Button type="button" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>

          <Button
            type="button"
            className="bg-red-600"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry"}
          </Button>
        </div>
      )}

      {!error && a.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-slate-500">
            You have not submitted any assignments yet.
          </p>
        </div>
      )}

      {!error && a.length > 0 && (
        <div className="space-y-3">
          {a.map((x) => (
            <div key={x.id} className="rounded-lg border p-4">
              {/* Assignment information */}

              <p className="text-xs text-slate-500">
                Assignment {x.assignmentId} ·{" "}
                {x.submittedAt
                  ? new Date(x.submittedAt).toLocaleString()
                  : "Submission time unavailable"}
              </p>

              <div className="my-3">
                <p className="mb-1 text-sm font-medium">Your Answer</p>

                <div className="rounded-md bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm">
                    {x.content || "No content submitted."}
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {x.status || "Submitted"}
              </p>

              <p className="text-sm">
                <span className="font-medium">Marks:</span>{" "}
                {x.marks ?? "Not graded"}
              </p>

              <p className="text-sm">
                <span className="font-medium">Feedback:</span>{" "}
                {x.feedback || "None"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
