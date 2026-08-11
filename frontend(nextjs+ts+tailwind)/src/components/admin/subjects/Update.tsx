"use client";

import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import type { Subject, Course, User } from "@/types";
import { Button, Card, Input, Select } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [s, setS] = useState<Subject | null>(null);
  const [c, setC] = useState<Course[]>([]);
  const [t, setT] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [subjects, courses, users] = await Promise.all([
          get<Subject[]>("/admin/subjects"),
          get<Course[]>("/admin/courses"),
          get<User[]>("/admin/users"),
        ]);

        if (!mounted) return;

        const subject = subjects.find((x) => x.id === id);

        if (!subject) {
          setError("Subject not found.");
          setS(null);
          return;
        }

        setS(subject);
        setC(Array.isArray(courses) ? courses : []);

        setT(
          Array.isArray(users) ? users.filter((x) => x.role === "Teacher") : [],
        );
      } catch (err: any) {
        console.error("Failed to load subject:", err);

        if (mounted) {
          setError(getErrorMessage(err));
          setS(null);
          setC([]);
          setT([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  function handleCourseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const courseId = e.target.value;

    const selectedCourse = c.find((x) => x.id === courseId);

    setS((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        courseId,
        name: selectedCourse?.description || "",
      };
    });

    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (isSaving) return;

    setError("");

    if (!s) {
      setError("Subject data is not available.");
      return;
    }

    if (!s.courseId) {
      setError("Please select a course.");
      return;
    }

    if (!s.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    const selectedCourse = c.find((x) => x.id === s.courseId);

    if (!selectedCourse) {
      setError("Selected course could not be found.");
      return;
    }

    try {
      setIsSaving(true);

      await put("/admin/subjects/" + id, {
        name: s.name.trim(),
        courseId: s.courseId,
        teacherId: s.teacherId || null,
      });

      setIsNavigating(true);

      r.push("/admin/subjects");
    } catch (err: any) {
      console.error("Failed to update subject:", err);

      setError(getErrorMessage(err));
      setIsSaving(false);
      setIsNavigating(false);
    }
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading subject..." />;
  }

  if (!s) {
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
            <p className="text-sm text-gray-500">
              Unable to load this subject.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={() => r.push("/admin/subjects")}
            >
              Back to Subjects
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

      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading text="Loading subjects..." />
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Update Subject</h2>

        <form className="w-full max-w-xl space-y-4" onSubmit={save}>
          <Select
            value={s.courseId || ""}
            onChange={handleCourseChange}
            required
            disabled={isSaving}
          >
            <option value="">Select course code</option>

            {c.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Subject name"
            value={s.name}
            onChange={(e) => {
              setS({
                ...s,
                name: e.target.value,
              });

              setError("");
            }}
            required
            disabled={isSaving}
          />

          <Select
            value={s.teacherId || ""}
            onChange={(e) => {
              setS({
                ...s,
                teacherId: e.target.value || null,
              });

              setError("");
            }}
            disabled={isSaving}
          >
            <option value="">No teacher</option>

            {t.map((x) => (
              <option key={x.id} value={x.id}>
                {x.email}
              </option>
            ))}
          </Select>

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
