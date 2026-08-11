"use client";

import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { Assignment } from "@/types";
import { Button, Card, Input, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

const localDate = (v: string) => {
  const d = new Date(v);
  const p = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(
    d.getDate(),
  )}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [a, setA] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

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

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const xs = await get<Assignment[]>("/teacher/assignments");

        if (!mounted) return;

        const assignment = xs.find((x) => x.id === id) || null;

        if (!assignment) {
          setError("Assignment not found.");
          setA(null);
          return;
        }

        setA(assignment);
      } catch (err: any) {
        console.error("Failed to load assignment:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setA(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!a || isSaving) return;

    setSubmitError("");

    const title = a.title?.trim();
    const description = a.description?.trim();

    if (!title) {
      setSubmitError("Assignment title is required.");
      return;
    }

    if (!description) {
      setSubmitError("Assignment description is required.");
      return;
    }

    if (!a.deadline) {
      setSubmitError("Deadline is required.");
      return;
    }

    const deadlineDate = new Date(a.deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      setSubmitError("Invalid deadline.");
      return;
    }

    if (deadlineDate <= new Date()) {
      setSubmitError("Deadline must be in the future.");
      return;
    }

    const marks = Number(a.maximumMarks);

    if (!Number.isFinite(marks) || marks <= 0) {
      setSubmitError("Maximum marks must be greater than 0.");
      return;
    }

    try {
      setIsSaving(true);

      await put("/teacher/assignments/" + id, {
        title,
        description,
        deadline: deadlineDate.toISOString(),
        maximumMarks: marks,
        courseId: a.courseId,
        subjectId: a.subjectId,
      });

      setIsNavigating(true);

      r.push("/teacher/assignments");
    } catch (err: any) {
      console.error("Failed to update assignment:", err);

      setSubmitError(getErrorMessage(err));
      setIsSaving(false);
      setIsNavigating(false);
    }
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading assignment..." />;
  }

  if (!a) {
    return (
      <>
        {error && (
          <div className="fixed right-4 top-4 z-[110] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-200 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-700">
                  Something went wrong
                </p>

                <p className="mt-1 break-words text-sm text-gray-600">
                  {error}
                </p>
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
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">
              Unable to load this assignment.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={() => r.push("/teacher/assignments")}
            >
              Back to Assignments
            </Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading assignments..." />
        </div>
      )}

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
        <h2 className="mb-4 text-lg font-semibold">Update Assignment</h2>

        <form className="max-w-2xl space-y-3" onSubmit={save}>
          <Input
            value={a.title}
            placeholder="Assignment title"
            onChange={(e) => {
              setA({ ...a, title: e.target.value });
              setSubmitError("");
            }}
            required
            disabled={isSaving}
          />

          <Textarea
            value={a.description}
            placeholder="Assignment description"
            onChange={(e) => {
              setA({ ...a, description: e.target.value });
              setSubmitError("");
            }}
            required
            disabled={isSaving}
          />

          <Input
            type="datetime-local"
            value={localDate(a.deadline)}
            onChange={(e) => {
              setA({ ...a, deadline: e.target.value });
              setSubmitError("");
            }}
            required
            disabled={isSaving}
          />

          <Input
            type="number"
            min="1"
            value={a.maximumMarks}
            onChange={(e) => {
              setA({
                ...a,
                maximumMarks: Number(e.target.value),
              });
              setSubmitError("");
            }}
            required
            disabled={isSaving}
          />

          {submitError && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </Card>
    </>
  );
}
