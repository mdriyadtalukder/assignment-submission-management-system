"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Submission } from "@/types";
import { Card, Button } from "@/components/ui";
import Loading from "@/components/Loading";

export default function View() {
  const [a, setA] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function getErrorMessage(err: any) {
    if (err?.response?.data?.message) {
      const message = err.response.data.message;

      if (Array.isArray(message)) {
        return message.join(", ");
      }

      return String(message);
    }

    if (err?.message) {
      return String(err.message);
    }

    return "Something went wrong. Please try again.";
  }

  async function load() {
    try {
      setIsLoading(true);
      setError("");

      const submissions = await get<Submission[]>("/admin/submissions");

      setA(Array.isArray(submissions) ? submissions : []);
    } catch (err: any) {
      console.error("Failed to load submissions:", err);

      setError(getErrorMessage(err));
      setA([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    return <Loading fullScreen text="Loading submissions..." />;
  }

  return (
    <>
      {error && (
        <div className="fixed right-4 top-4 z-[110] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
              !
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-700">Something went wrong</p>

              <p className="mt-1 break-words text-sm text-gray-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xl leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Submissions</h2>

        {a.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No submissions found.</p>

            <Button
              type="button"
              onClick={load}
              className="mt-4"
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        ) : (
          a.map((x) => (
            <div key={x.id} className="mb-3 rounded-lg border p-3">
              <div className="break-all text-xs text-slate-500">
                Assignment {x.assignmentId} · Student {x.studentId}
              </div>

              <p className="my-2 whitespace-pre-wrap break-words">
                {x.content || "-"}
              </p>

              <p className="break-words text-sm">
                Status: {x.status || "Submitted"} · Marks: {x.marks ?? "-"} ·
                Feedback: {x.feedback || "-"}
              </p>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
