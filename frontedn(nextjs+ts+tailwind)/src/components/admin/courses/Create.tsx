"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Create() {
  const r = useRouter();

  const [n, setN] = useState("");
  const [d, setD] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
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

  async function s(e: React.FormEvent) {
    e.preventDefault();

    if (isCreating) return;

    setError("");

    const name = n.trim();

    if (!name) {
      setError("Course code is required.");
      return;
    }

    try {
      setIsCreating(true);

      await post("/admin/courses", {
        name,
        description: d.trim() || null,
      });

      setIsNavigating(true);

      r.push("/admin/courses");
    } catch (err: any) {
      console.error("Failed to create course:", err);
      setError(getErrorMessage(err));
      setIsCreating(false);
      setIsNavigating(false);
    }
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
              <p className="font-semibold text-red-700">Creation failed</p>

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

      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading courses..." />
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Create Course</h2>

        <form className="max-w-xl space-y-3" onSubmit={s}>
          <Input
            placeholder="Code"
            value={n}
            onChange={(e) => {
              setN(e.target.value);
              setError("");
            }}
            disabled={isCreating}
            required
          />

          <Textarea
            placeholder="Name"
            value={d}
            onChange={(e) => {
              setD(e.target.value);
              setError("");
            }}
            required
            disabled={isCreating}
          />

          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating...
              </span>
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </Card>
    </>
  );
}
