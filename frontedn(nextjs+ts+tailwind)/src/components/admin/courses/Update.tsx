"use client";

import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { Course } from "@/types";
import { Button, Card, Input, Textarea } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [c, setC] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      try {
        setIsLoading(true);
        setError("");

        const courses = await get<Course[]>("/admin/courses");

        if (!mounted) return;

        const course = courses.find((x) => x.id === id);

        if (!course) {
          setError("Course not found.");
          setC(null);
          return;
        }

        setC(course);
      } catch (err: any) {
        console.error("Failed to load course:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setC(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [id]);

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

    if (!c || isSaving) return;

    setError("");

    const name = c.name.trim();

    if (!name) {
      setError("Course code is required.");
      return;
    }

    try {
      setIsSaving(true);

      await put("/admin/courses/" + id, {
        name,
        description: c.description?.trim() || null,
      });

      setIsNavigating(true);

      r.push("/admin/courses");
    } catch (err: any) {
      console.error("Failed to update course:", err);
      setError(getErrorMessage(err));
      setIsSaving(false);
      setIsNavigating(false);
    }
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading course..." />;
  }

  if (!c) {
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
            <h2 className="text-lg font-semibold text-gray-800">
              Course not found
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The course you are trying to update does not exist.
            </p>

            <Button
              type="button"
              onClick={() => r.push("/admin/courses")}
              className="mt-4"
            >
              Back to Courses
            </Button>
          </div>
        </Card>
      </>
    );
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
              <p className="font-semibold text-red-700">Update failed</p>

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
        <h2 className="mb-4 text-lg font-semibold">Update Course</h2>

        <form className="max-w-xl space-y-3" onSubmit={s}>
          <Input
            value={c.name}
            placeholder="Code"
            onChange={(e) => {
              setC({ ...c, name: e.target.value });
              setError("");
            }}
            disabled={isSaving}
            required
          />

          <Textarea
            value={c.description || ""}
            placeholder="Name"
            onChange={(e) => {
              setC({ ...c, description: e.target.value });
              setError("");
            }}
            disabled={isSaving}
            required
          />

          <div className="flex gap-3">
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

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => r.push("/admin/courses")}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
