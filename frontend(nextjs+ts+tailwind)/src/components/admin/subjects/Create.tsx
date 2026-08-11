"use client";

import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Course, User } from "@/types";
import { Button, Card, Input, Select } from "@/components/ui";
import Loading from "@/components/Loading";

export default function Create() {
  const r = useRouter();

  const [c, setC] = useState<Course[]>([]);
  const [t, setT] = useState<User[]>([]);

  const [n, setN] = useState("");
  const [ci, setCi] = useState("");
  const [ti, setTi] = useState("");

  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [cs, us] = await Promise.all([
          get<Course[]>("/admin/courses"),
          get<User[]>("/admin/users"),
        ]);

        if (!mounted) return;

        setC(Array.isArray(cs) ? cs : []);

        setT(Array.isArray(us) ? us.filter((x) => x.role === "Teacher") : []);
      } catch (err: any) {
        console.error("Failed to load courses and teachers:", err);

        if (mounted) {
          setError(getErrorMessage(err));
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
  }, []);

  function handleCourseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const courseId = e.target.value;

    setCi(courseId);
    setError("");

    const selectedCourse = c.find((x) => x.id === courseId);

    setN(selectedCourse?.description || "");
  }

  async function s(e: React.FormEvent) {
    e.preventDefault();

    if (isCreating) return;

    setError("");

    if (!ci) {
      setError("Please select a course.");
      return;
    }

    if (!n.trim()) {
      setError("Subject name is required.");
      return;
    }

    const selectedCourse = c.find((x) => x.id === ci);

    if (!selectedCourse) {
      setError("Selected course could not be found.");
      return;
    }

    try {
      setIsCreating(true);

      await post("/admin/subjects", {
        name: n.trim(),
        courseId: ci,
        teacherId: ti || null,
      });

      setIsNavigating(true);

      r.push("/admin/subjects");
    } catch (err: any) {
      console.error("Failed to create subject:", err);

      setError(getErrorMessage(err));
      setIsCreating(false);
      setIsNavigating(false);
    }
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading courses and teachers..." />;
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
        <h2 className="mb-4 text-lg font-semibold">Create Subject</h2>

        <form className="w-full max-w-xl space-y-4" onSubmit={s}>
          <Select
            value={ci}
            onChange={handleCourseChange}
            required
            disabled={isCreating}
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
            value={n}
            onChange={(e) => {
              setN(e.target.value);
              setError("");
            }}
            required
            disabled={isCreating}
          />

          <Select
            value={ti}
            onChange={(e) => {
              setTi(e.target.value);
              setError("");
            }}
            disabled={isCreating}
            required
          >
            <option value="">No teacher</option>

            {t.map((x) => (
              <option key={x.id} value={x.id}>
                {x.email}
              </option>
            ))}
          </Select>

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
