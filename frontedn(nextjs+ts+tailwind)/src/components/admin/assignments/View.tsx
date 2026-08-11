"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Assignment } from "@/types";
import { Card, Button } from "@/components/ui";
import Loading from "@/components/Loading";

export default function View() {
  const [a, setA] = useState<Assignment[]>([]);
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

      const assignments = await get<Assignment[]>("/admin/assignments");

      setA(Array.isArray(assignments) ? assignments : []);
    } catch (err: any) {
      console.error("Failed to load assignments:", err);

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
    return <Loading fullScreen text="Loading assignments..." />;
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
        <h2 className="mb-4 text-lg font-semibold">Assignments</h2>

        {a.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No assignments found.</p>

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
              <b className="break-words">{x.title}</b>

              <p className="text-sm text-slate-500">
                {x.status} · {new Date(x.deadline).toLocaleString()} · Max{" "}
                {x.maximumMarks}
              </p>

              <p className="mt-1 break-words text-sm">
                {x.description || "No description"}
              </p>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
