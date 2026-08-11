"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { Course } from "@/types";
import { Button, Card } from "@/components/ui";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Delete from "@/components/admin/courses/Delete";

export default function View() {
  const [a, setA] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");

  const r = useRouter();
  const pathname = usePathname();

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

      const courses = await get<Course[]>("/admin/courses");

      setA(Array.isArray(courses) ? courses : []);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setError(getErrorMessage(err));
      setA([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  function navigateTo(url: string) {
    if (isNavigating) return;

    setIsNavigating(true);
    r.push(url);
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading courses..." />;
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
          <Loading text="Loading page..." />
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Courses</h2>

          <Button
            onClick={() => navigateTo("/admin/courses/create")}
            disabled={isNavigating}
          >
            Create
          </Button>
        </div>

        {a.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No courses found.</p>

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
            <div
              key={x.id}
              className="mb-2 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <b className="break-words">{x.name}</b>

                <p className="break-words text-sm text-slate-500">
                  {x.description || "No description"}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  onClick={() => navigateTo("/admin/courses/update/" + x.id)}
                  disabled={isNavigating}
                >
                  Update
                </Button>

                <Delete id={x.id} onDeleted={load} />
              </div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
